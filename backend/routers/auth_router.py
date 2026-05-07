"""Google OAuth + JWT issuance.

OAuth CSRF protection:
  - On /auth/google/login we generate a random nonce, store its sha256
    digest in an HttpOnly, SameSite=Lax cookie (`oauth_state`), and embed
    `<rol>:<nonce>` in the OAuth `state` parameter.
  - On /auth/google/callback we require the cookie to be present and verify
    that sha256(nonce_from_state) matches the cookie value. The cookie is
    cleared after use. The role is extracted independently of the CSRF
    nonce so the nonce can never be impersonated by manipulating the role.
"""
import hashlib
import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Cookie, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from config.settings import (
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    FRONTEND_URL,
    DEV_LOGIN_ENABLED,
    ENVIRONMENT,
)
from database.connection import get_db
from dependencies.auth import create_access_token, get_current_user
from models.usuario import Usuario
from models.candidato import Candidato
from models.reclutador import Reclutador

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"

OAUTH_STATE_COOKIE = "oauth_state"
OAUTH_STATE_TTL = 600  # seconds


def _is_configured() -> bool:
    return bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)


def _hash_nonce(nonce: str) -> str:
    return hashlib.sha256(nonce.encode("utf-8")).hexdigest()


def _cookie_secure() -> bool:
    return ENVIRONMENT == "production"


@router.get("/google/login")
def google_login(rol: str = Query("candidato", regex="^(candidato|reclutador)$")):
    if not _is_configured():
        raise HTTPException(status_code=503, detail="Google OAuth not configured")

    nonce = secrets.token_urlsafe(32)
    state = f"{rol}:{nonce}"

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "prompt": "select_account",
        "state": state,
    }
    resp = RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")
    resp.set_cookie(
        key=OAUTH_STATE_COOKIE,
        value=_hash_nonce(nonce),
        max_age=OAUTH_STATE_TTL,
        httponly=True,
        secure=_cookie_secure(),
        samesite="lax",
        path="/auth",
    )
    return resp


def _parse_state(state: str) -> tuple[str, str]:
    if ":" not in state:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")
    rol, _, nonce = state.partition(":")
    if rol not in ("candidato", "reclutador") or not nonce:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")
    return rol, nonce


@router.get("/google/callback")
def google_callback(
    code: str = Query(...),
    state: str = Query(...),
    oauth_state: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if not _is_configured():
        raise HTTPException(status_code=503, detail="Google OAuth not configured")

    rol, nonce = _parse_state(state)

    if not oauth_state or not secrets.compare_digest(oauth_state, _hash_nonce(nonce)):
        raise HTTPException(status_code=400, detail="OAuth state validation failed (CSRF)")

    token_resp = httpx.post(
        GOOGLE_TOKEN_URL,
        data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
        timeout=15.0,
    )
    if token_resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Google token exchange failed: {token_resp.text}")
    access_token = token_resp.json().get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access_token from Google")

    uinfo = httpx.get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=15.0,
    )
    if uinfo.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch userinfo")
    info = uinfo.json()

    oauth_id = info.get("sub")
    email = info.get("email")
    name = info.get("name") or email or "Usuario"
    if not oauth_id or not email:
        raise HTTPException(status_code=400, detail="Incomplete Google profile")

    user = (
        db.query(Usuario)
        .filter(Usuario.oauth_provider == "google", Usuario.oauth_id == oauth_id)
        .first()
    )
    if not user:
        user = db.query(Usuario).filter(Usuario.email == email).first()

    if not user:
        user = Usuario(
            email=email,
            oauth_provider="google",
            oauth_id=oauth_id,
            rol=rol,
        )
        db.add(user)
        db.flush()

        if rol == "candidato":
            db.add(Candidato(id_usuario=user.id, nombre=name, profile_text=f"Nombre: {name}."))
        else:
            db.add(
                Reclutador(
                    id_usuario=user.id,
                    nombre=name,
                    nombre_compania=name,
                )
            )
        db.commit()
        db.refresh(user)
    else:
        if not user.oauth_provider:
            user.oauth_provider = "google"
            user.oauth_id = oauth_id
            db.commit()

    jwt_token = create_access_token(user_id=user.id, rol=user.rol)
    redirect = f"{FRONTEND_URL}/auth/callback#token={jwt_token}&rol={user.rol}"
    resp = RedirectResponse(redirect)
    # Single-use: clear the state cookie now that it has been validated.
    resp.delete_cookie(OAUTH_STATE_COOKIE, path="/auth")
    return resp


@router.get("/me")
def me(user: Usuario = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "rol": user.rol,
        "oauth_provider": user.oauth_provider,
    }


@router.post("/dev-login")
def dev_login(email: str, db: Session = Depends(get_db)):
    """Dev-only helper. Disabled unless `DEV_LOGIN_ENABLED=1` AND
    `ENVIRONMENT` is not `production`. Returns 404 otherwise."""
    if not DEV_LOGIN_ENABLED:
        raise HTTPException(status_code=404, detail="Not Found")
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    token = create_access_token(user_id=user.id, rol=user.rol)
    return {"token": token, "rol": user.rol, "id": user.id, "email": user.email}