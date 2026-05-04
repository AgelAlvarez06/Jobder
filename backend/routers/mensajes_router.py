from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import get_db, get_current_user
from models.usuario import Usuario
from models.candidato import Candidato
from models.reclutador import Reclutador
from models.match import Match
from models.mensaje import Mensaje
from schemas.mensaje_schema import MensajeCreate, MensajeOut
from typing import List

router = APIRouter(prefix='/matches/{match_id}/mensajes', tags=['mensajes'])


def _verify_match_access(db: Session, match_id: int, user: Usuario) -> Match:
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match no encontrado")

    if user.rol == 'candidato':
        candidato = db.query(Candidato).filter(Candidato.id_usuario == user.id).first()
        if not candidato or match.id_candidato != candidato.id:
            raise HTTPException(status_code=403, detail="No tienes acceso a este match")
    elif user.rol == 'reclutador':
        reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == user.id).first()
        if not reclutador or match.id_reclutador != reclutador.id:
            raise HTTPException(status_code=403, detail="No tienes acceso a este match")

    return match


@router.post('/', response_model=MensajeOut)
def send_message(
    match_id: int,
    data: MensajeCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _verify_match_access(db, match_id, current_user)

    mensaje = Mensaje(
        id_match=match_id,
        id_remitente=current_user.id,
        contenido=data.contenido,
    )
    db.add(mensaje)
    db.commit()
    db.refresh(mensaje)
    return mensaje


@router.get('/', response_model=List[MensajeOut])
def list_messages(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _verify_match_access(db, match_id, current_user)

    mensajes = db.query(Mensaje).filter(
        Mensaje.id_match == match_id,
    ).order_by(Mensaje.fecha_envio.asc()).all()
    return mensajes
