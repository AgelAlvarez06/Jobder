from pydantic import BaseModel
from typing import Optional


class ReclutadorCreate(BaseModel):
    nombre: str
    nombre_compania: str
    descripcion_compania: Optional[str] = None


class ReclutadorUpdate(BaseModel):
    nombre: Optional[str] = None
    nombre_compania: Optional[str] = None
    descripcion_compania: Optional[str] = None


class ReclutadorOut(BaseModel):
    id: int
    id_usuario: Optional[int] = None
    nombre: Optional[str] = None
    nombre_compania: Optional[str] = None
    descripcion_compania: Optional[str] = None

    class Config:
        from_attributes = True
