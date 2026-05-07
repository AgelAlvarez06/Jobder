from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from config.settings import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS
from database.connection import get_db
from models.usuario import Usuario
from models.candidato import Candidato
from models.reclutador import Reclutador


bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(*, user_id: int, rol: str) -> str:
    payload = {
        "sub": str(user_id),
        "rol": rol,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
        )


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    data = _decode(credentials.credentials)
    user_id = data.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = db.query(Usuario).filter(Usuario.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_candidato(
    user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Candidato:
    if user.rol != "candidato":
        raise HTTPException(status_code=403, detail="Candidato role required")
    candidato = db.query(Candidato).filter(Candidato.id_usuario == user.id).first()
    if not candidato:
        raise HTTPException(status_code=404, detail="Candidato profile not found")
    return candidato


def require_reclutador(
    user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Reclutador:
    if user.rol != "reclutador":
        raise HTTPException(status_code=403, detail="Reclutador role required")
    recl = db.query(Reclutador).filter(Reclutador.id_usuario == user.id).first()
    if not recl:
        raise HTTPException(status_code=404, detail="Reclutador profile not found")
    return recl
