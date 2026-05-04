from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import get_db, get_current_user
from models.usuario import Usuario
from models.candidato import Candidato
from models.reclutador import Reclutador
from models.vacante import Vacante
from models.interaccion import Interaccion
from models.match import Match
from schemas.match_schema import MatchCreate, MatchOut
from typing import List

router = APIRouter(prefix='/matches', tags=['matches'])


@router.post('/', response_model=MatchOut)
def create_match(
    data: MatchCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != 'reclutador':
        raise HTTPException(status_code=403, detail="Solo reclutadores pueden crear matches")

    reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == current_user.id).first()
    if not reclutador:
        raise HTTPException(status_code=404, detail="Perfil de reclutador no encontrado")

    vacante = db.query(Vacante).filter(
        Vacante.id == data.id_vacante,
        Vacante.id_reclutador == reclutador.id,
    ).first()
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada o no pertenece al reclutador")

    liked = db.query(Interaccion).filter(
        Interaccion.id_candidato == data.id_candidato,
        Interaccion.id_vacante == data.id_vacante,
        Interaccion.accion == 'liked',
    ).first()
    if not liked:
        raise HTTPException(status_code=400, detail="El candidato no ha dado like a esta vacante")

    existing_match = db.query(Match).filter(
        Match.id_candidato == data.id_candidato,
        Match.id_vacante == data.id_vacante,
    ).first()
    if existing_match:
        raise HTTPException(status_code=400, detail="Ya existe un match para este candidato y vacante")

    match = Match(
        id_candidato=data.id_candidato,
        id_vacante=data.id_vacante,
        id_reclutador=reclutador.id,
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


@router.get('/', response_model=List[MatchOut])
def list_my_matches(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol == 'candidato':
        candidato = db.query(Candidato).filter(Candidato.id_usuario == current_user.id).first()
        if not candidato:
            return []
        matches = db.query(Match).filter(Match.id_candidato == candidato.id).order_by(Match.fecha_match.desc()).all()
    elif current_user.rol == 'reclutador':
        reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == current_user.id).first()
        if not reclutador:
            return []
        matches = db.query(Match).filter(Match.id_reclutador == reclutador.id).order_by(Match.fecha_match.desc()).all()
    else:
        matches = []

    return matches


@router.get('/{match_id}', response_model=MatchOut)
def get_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match no encontrado")

    if current_user.rol == 'candidato':
        candidato = db.query(Candidato).filter(Candidato.id_usuario == current_user.id).first()
        if not candidato or match.id_candidato != candidato.id:
            raise HTTPException(status_code=403, detail="No tienes acceso a este match")
    elif current_user.rol == 'reclutador':
        reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == current_user.id).first()
        if not reclutador or match.id_reclutador != reclutador.id:
            raise HTTPException(status_code=403, detail="No tienes acceso a este match")

    return match