from typing import Optional, Literal
from pydantic import BaseModel


Accion = Literal["liked", "disliked", "viewed"]


class InteraccionIn(BaseModel):
    """Unified swipe payload.

    For a candidate JWT, only `vacante_id` is required.
    For a recruiter JWT, both `vacante_id` and `candidato_id` are required;
    the recruiter must own the vacancy.
    """

    vacante_id: int
    candidato_id: Optional[int] = None
    accion: Accion


class InteraccionResult(BaseModel):
    status: str
    interaccion_id: int
    match: bool = False
    match_id: Optional[int] = None
