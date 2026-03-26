from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InteraccionCreate(BaseModel):
    id_vacante: int
    accion: str
    score_similitud: Optional[float] = None


class InteraccionOut(BaseModel):
    id: int
    id_candidato: int
    id_vacante: int
    score_similitud: Optional[float] = None
    accion: str
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True