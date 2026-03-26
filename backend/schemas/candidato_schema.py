from pydantic import BaseModel
from typing import Optional, Any

class CandidatoCreate(BaseModel):
    nombre: str
    profile_text: str
    telefono: Optional[str] = None
    ubicacion: Optional[str] = None
    carrera: Optional[str] = None
    habilidades: Optional[Any] = None
    idiomas: Optional[Any] = None
    descripcion: Optional[str] = None


class CandidatoUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    ubicacion: Optional[str] = None
    carrera: Optional[str] = None
    habilidades: Optional[Any] = None
    idiomas: Optional[Any] = None
    descripcion: Optional[str] = None
    profile_text: Optional[str] = None


class CandidatoOut(BaseModel):
    id: int
    id_usuario: Optional[int] = None
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    ubicacion: Optional[str] = None
    carrera: Optional[str] = None
    habilidades: Optional[Any] = None
    idiomas: Optional[Any] = None
    descripcion: Optional[str] = None
    profile_text: Optional[str] = None

    class Config:
        from_attributes = True