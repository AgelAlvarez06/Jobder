from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MatchCreate(BaseModel):
    id_candidato: int
    id_vacante: int


class MatchOut(BaseModel):
    id: int
    id_candidato: int
    id_vacante: int
    id_reclutador: int
    fecha_match: Optional[datetime] = None

    class Config:
        from_attributes = True
