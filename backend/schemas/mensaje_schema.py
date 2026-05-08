from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class MensajeCreate(BaseModel):
    contenido: str = Field(..., min_length=1, max_length=4000)


class MensajeOut(BaseModel):
    id: int
    id_match: int
    id_remitente: int
    contenido: Optional[str]
    fecha_envio: Optional[datetime]
    read_at: Optional[datetime]

    class Config:
        from_attributes = True


class ReadAck(BaseModel):
    status: str
    marked: int
