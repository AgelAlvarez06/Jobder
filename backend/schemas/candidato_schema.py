from typing import Optional, List, Any, Dict
from pydantic import BaseModel


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
    structured_data: Optional[Dict[str, Any]] = None
    profile_text: Optional[str] = None
    embedding_model: Optional[str] = None

    class Config:
        from_attributes = True
