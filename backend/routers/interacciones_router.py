from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import get_db, get_current_user
from models.usuario import Usuario
from models.candidato import Candidato
from models.interaccion import Interaccion
from schemas.interaccion_schema import InteraccionCreate, InteraccionOut
from typing import List

router = APIRouter(prefix='/interacciones', tags=['interacciones'])


def _get_candidato_for_user(db: Session, user: Usuario) -> Candidato:
    candidato = db.query(Candidato).filter(Candidato.id_usuario == user.id).first()
    if not candidato:
        raise HTTPException(status_code=404, detail="Perfil de candidato no encontrado")
    return candidato


@router.post('/', response_model=InteraccionOut)
def create_interaccion(
    data: InteraccionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if data.accion not in ('viewed', 'liked', 'disliked'):
        raise HTTPException(status_code=400, detail="Acción debe ser 'viewed', 'liked' o 'disliked'")

    candidato = _get_candidato_for_user(db, current_user)

    existing = db.query(Interaccion).filter(
        Interaccion.id_candidato == candidato.id,
        Interaccion.id_vacante == data.id_vacante,
    ).first()

    if existing:
        existing.accion = data.accion
        if data.score_similitud is not None:
            existing.score_similitud = data.score_similitud
        db.commit()
        db.refresh(existing)
        return existing

    interaccion = Interaccion(
        id_candidato=candidato.id,
        id_vacante=data.id_vacante,
        accion=data.accion,
        score_similitud=data.score_similitud,
    )
    db.add(interaccion)
    db.commit()
    db.refresh(interaccion)
    return interaccion


@router.get('/', response_model=List[InteraccionOut])
def list_my_interacciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    candidato = _get_candidato_for_user(db, current_user)
    interacciones = db.query(Interaccion).filter(
        Interaccion.id_candidato == candidato.id,
    ).order_by(Interaccion.fecha_creacion.desc()).all()
    return interacciones


@router.get('/liked', response_model=List[InteraccionOut])
def list_liked(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    candidato = _get_candidato_for_user(db, current_user)
    interacciones = db.query(Interaccion).filter(
        Interaccion.id_candidato == candidato.id,
        Interaccion.accion == 'liked',
    ).order_by(Interaccion.fecha_creacion.desc()).all()
    return interacciones