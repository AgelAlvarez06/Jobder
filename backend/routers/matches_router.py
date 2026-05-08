from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.connection import get_db
from dependencies.auth import get_current_user
from models.candidato import Candidato
from models.match import Match
from models.mensaje import Mensaje
from models.reclutador import Reclutador
from models.usuario import Usuario
from models.vacante import Vacante

router = APIRouter(prefix="/matches", tags=["matches"])

def _last_message_map(db: Session, match_ids: list[int]) -> dict[int, Mensaje]:
    if not match_ids:
        return {}
    # Subquery: max(id) per match → last message
    sub = (
        db.query(Mensaje.id_match, func.max(Mensaje.id).label("max_id"))
        .filter(Mensaje.id_match.in_(match_ids))
        .group_by(Mensaje.id_match)
        .subquery()
    )
    rows = (
        db.query(Mensaje)
        .join(sub, (sub.c.id_match == Mensaje.id_match) & (sub.c.max_id == Mensaje.id))
        .all()
    )
    return {m.id_match: m for m in rows}


def _unread_counts(
    db: Session, match_ids: list[int], user_id: int
) -> dict[int, int]:
    if not match_ids:
        return {}
    rows = (
        db.query(Mensaje.id_match, func.count(Mensaje.id))
        .filter(
            Mensaje.id_match.in_(match_ids),
            Mensaje.id_remitente != user_id,
            Mensaje.read_at.is_(None),
        )
        .group_by(Mensaje.id_match)
        .all()
    )
    return {mid: int(cnt) for mid, cnt in rows}


def _serialize_message(msg: Optional[Mensaje]) -> Optional[dict]:
    if msg is None:
        return None
    return {
        "id": msg.id,
        "id_remitente": msg.id_remitente,
        "contenido": msg.contenido,
        "fecha_envio": msg.fecha_envio.isoformat() if msg.fecha_envio else None,
    }



@router.get("/")
def list_matches(
    user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.rol == "candidato":
        candidato = db.query(Candidato).filter(Candidato.id_usuario == user.id).first()
        if not candidato:
            return []
        rows = (
            db.query(Match, Vacante, Reclutador)
            .join(Vacante, Vacante.id == Match.id_vacante)
            .join(Reclutador, Reclutador.id == Match.id_reclutador)
            .filter(Match.id_candidato == candidato.id)
            .order_by(Match.fecha_match.desc())
            .all()
        )
        match_ids = [m.id for (m, _, _) in rows]
        last_by_match = _last_message_map(db, match_ids)
        unread_by_match = _unread_counts(db, match_ids, user.id)
        return [
            {
                "id": m.id,
                "vacante": {"id": v.id, "titulo": v.titulo},
                "reclutador": {"id": r.id, "nombre_compania": r.nombre_compania},
                "fecha_match": m.fecha_match.isoformat() if m.fecha_match else None,
                "last_message": _serialize_message(last_by_match.get(m.id)),
                "unread_count": unread_by_match.get(m.id, 0),
            }
            for (m, v, r) in rows
        ]
    elif user.rol == "reclutador":
        recl = db.query(Reclutador).filter(Reclutador.id_usuario == user.id).first()
        if not recl:
            return []
        rows = (
            db.query(Match, Vacante, Candidato)
            .join(Vacante, Vacante.id == Match.id_vacante)
            .join(Candidato, Candidato.id == Match.id_candidato)
            .filter(Match.id_reclutador == recl.id)
            .order_by(Match.fecha_match.desc())
            .all()
        )
        match_ids = [m.id for (m, _, _) in rows]
        last_by_match = _last_message_map(db, match_ids)
        unread_by_match = _unread_counts(db, match_ids, user.id)
        return [
            {
                "id": m.id,
                "vacante": {"id": v.id, "titulo": v.titulo},
                "candidato": {"id": c.id, "nombre": c.nombre, "carrera": c.carrera},
                "fecha_match": m.fecha_match.isoformat() if m.fecha_match else None,
                "last_message": _serialize_message(last_by_match.get(m.id)),
                "unread_count": unread_by_match.get(m.id, 0),
            }
            for (m, v, c) in rows
        ]
    return []