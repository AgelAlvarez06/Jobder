from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.connection import get_db
from dependencies.auth import require_reclutador
from models.reclutador import Reclutador

router = APIRouter(prefix="/reclutadores", tags=["reclutadores"])


class ReclutadorUpdate(BaseModel):
    nombre: Optional[str] = None
    nombre_compania: Optional[str] = None
    descripcion_compania: Optional[str] = None


def _serialize(r: Reclutador) -> dict:
    return {
        "id": r.id,
        "id_usuario": r.id_usuario,
        "nombre": r.nombre,
        "nombre_compania": r.nombre_compania,
        "descripcion_compania": r.descripcion_compania,
    }


@router.get("/me")
def get_me(reclutador: Reclutador = Depends(require_reclutador)):
    return _serialize(reclutador)


@router.patch("/me")
def update_me(
    data: ReclutadorUpdate,
    reclutador: Reclutador = Depends(require_reclutador),
    db: Session = Depends(get_db),
):
    if data.nombre is not None:
        reclutador.nombre = data.nombre
    if data.nombre_compania is not None:
        if not data.nombre_compania.strip():
            raise HTTPException(status_code=400, detail="nombre_compania cannot be empty")
        reclutador.nombre_compania = data.nombre_compania
    if data.descripcion_compania is not None:
        reclutador.descripcion_compania = data.descripcion_compania
    db.commit()
    db.refresh(reclutador)
    return _serialize(reclutador)