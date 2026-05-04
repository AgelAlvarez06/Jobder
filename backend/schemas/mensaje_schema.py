from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MensajeCreate(BaseModel):
    contenido: str


class MensajeOut(BaseModel):
    id: int
    id_match: int
    id_remitente: int
    contenido: str
    fecha_envio: Optional[datetime] = None

    class Config:
        from_attributes = True
