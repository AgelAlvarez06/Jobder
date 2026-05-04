from pydantic import BaseModel, EmailStr
from typing import Optional


class UsuarioRegister(BaseModel):
    email: EmailStr
    password: str
    rol: str


class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    rol: str


class UsuarioOut(BaseModel):
    id: int
    email: str
    rol: str

    class Config:
        from_attributes = True
