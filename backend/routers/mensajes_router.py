from datetime import datetime
from typing import Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from dependencies.auth import get_current_user
from models.candidato import Candidato
from models.match import Match
from models.mensaje import Mensaje
from models.reclutador import Reclutador
from models.usuario import Usuario
from models.vacante import Vacante
from schemas.mensaje_schema import MensajeCreate, MensajeOut, ReadAck

router = APIRouter(prefix="/matches", tags=["mensajes"])


def _load_match_for_user(
    match_id: int, user: Usuario, db: Session
) -> Tuple[Match, Vacante]:
    m = db.query(Match).filter(Match.id == match_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Match no encontrado")
    v = db.query(Vacante).filter(Vacante.id == m.id_vacante).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vacante del match no encontrada")

    if user.rol == "candidato":
        cand = db.query(Candidato).filter(Candidato.id_usuario == user.id).first()
        if not cand or cand.id != m.id_candidato:
            raise HTTPException(status_code=403, detail="No autorizado para este match")
    elif user.rol == "reclutador":
        recl = db.query(Reclutador).filter(Reclutador.id_usuario == user.id).first()
        if not recl or recl.id != m.id_reclutador:
            raise HTTPException(status_code=403, detail="No autorizado para este match")
    else:
        raise HTTPException(status_code=403, detail="Rol no soportado")

    return m, v


@router.get("/{match_id}/mensajes", response_model=list[MensajeOut])
def list_mensajes(
    match_id: int,
    after_id: Optional[int] = Query(None, ge=1),
    limit: int = Query(50, ge=1, le=200),
    user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _load_match_for_user(match_id, user, db)
    q = db.query(Mensaje).filter(Mensaje.id_match == match_id)
    if after_id is not None:
        q = q.filter(Mensaje.id > after_id)
    rows = q.order_by(Mensaje.id.asc()).limit(limit).all()
    return rows


@router.post("/{match_id}/mensajes", response_model=MensajeOut, status_code=201)
def send_mensaje(
    match_id: int,
    payload: MensajeCreate,
    user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _load_match_for_user(match_id, user, db)
    contenido = (payload.contenido or "").strip()
    if not contenido:
        raise HTTPException(status_code=400, detail="contenido vacío")

    msg = Mensaje(
        id_match=match_id,
        id_remitente=user.id,
        contenido=contenido,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.post("/{match_id}/mensajes/read", response_model=ReadAck)
def mark_read(
    match_id: int,
    user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _load_match_for_user(match_id, user, db)
    now = datetime.utcnow()
    # Mark only the OTHER party's unread messages as read.
    updated = (
        db.query(Mensaje)
        .filter(
            Mensaje.id_match == match_id,
            Mensaje.id_remitente != user.id,
            Mensaje.read_at.is_(None),
        )
        .update({Mensaje.read_at: now}, synchronize_session=False)
    )
    db.commit()
    return ReadAck(status="ok", marked=int(updated or 0))
