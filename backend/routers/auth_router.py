from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt
from dependencies.auth import get_db, create_access_token, get_current_user
from models.usuario import Usuario
from schemas.usuario_schema import UsuarioRegister, UsuarioLogin, TokenResponse, UsuarioOut

router = APIRouter(prefix='/auth', tags=['auth'])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


@router.post('/register', response_model=TokenResponse)
def register(data: UsuarioRegister, db: Session = Depends(get_db)):
    if data.rol not in ('candidato', 'reclutador'):
        raise HTTPException(status_code=400, detail="Rol debe ser 'candidato' o 'reclutador'")

    existing = db.query(Usuario).filter(Usuario.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    user = Usuario(
        email=data.email,
        password_hash=hash_password(data.password),
        rol=data.rol,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "rol": user.rol})

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        rol=user.rol,
    )


@router.post('/login', response_model=TokenResponse)
def login(data: UsuarioLogin, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token({"sub": user.id, "rol": user.rol})

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        rol=user.rol,
    )


@router.get('/me', response_model=UsuarioOut)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user
