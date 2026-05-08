"""Swipe / interaccion endpoints.

Persistence model (per-actor):
  - One row per (id_candidato, id_vacante, actor_role) — see schema unique
    constraint `uq_candidato_vacante_actor`.
  - Each side's swipes are recorded independently. Repeated swipes by the
    same actor update that actor's row in place; they cannot create a match
    by themselves.

Match rule:
  - A Match is created only when an incoming `liked` swipe by one actor finds
    an *existing* `liked` row by the OTHER actor for the same pair. This
    ensures a match requires explicit evidence from both sides.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.connection import get_db
from dependencies.auth import get_current_user
from models.candidato import Candidato
from models.interaccion import Interaccion
from models.match import Match
from models.reclutador import Reclutador
from models.usuario import Usuario
from models.vacante import Vacante
from schemas.interaccion_schema import InteraccionIn, InteraccionResult
from services import cache_service
from services.chroma_service import query_embedding
from services.gemini_service import get_or_generate_embedding
from utils.chroma_ids import vacante_id

router = APIRouter(prefix="/interacciones", tags=["interacciones"])

ROLE_CANDIDATO = "candidato"
ROLE_RECLUTADOR = "reclutador"


def _similarity_for(candidato: Candidato, vacante: Vacante) -> float:
    """Best-effort cosine similarity in [0, 1]. Returns 0 on any failure."""
    try:
        emb = get_or_generate_embedding(candidato.profile_text or "")
        results = query_embedding(query_embedding=emb, top_k=50, id_prefix="vacante_")
        target = vacante_id(vacante.id)
        for cid, dist in zip(results["ids"], results["distances"]):
            if cid == target:
                return float(max(0.0, 1.0 - dist))
    except Exception:
        pass
    return 0.0


def _ensure_match(db: Session, *, candidato_id: int, vacante: Vacante) -> Match:
    existing = (
        db.query(Match)
        .filter(Match.id_candidato == candidato_id, Match.id_vacante == vacante.id)
        .first()
    )
    if existing:
        return existing
    m = Match(
        id_candidato=candidato_id,
        id_vacante=vacante.id,
        id_reclutador=vacante.id_reclutador,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


def _record_swipe(
    db: Session,
    *,
    candidato: Candidato,
    vacante: Vacante,
    actor_role: str,
    accion: str,
) -> InteraccionResult:
    other_role = ROLE_RECLUTADOR if actor_role == ROLE_CANDIDATO else ROLE_CANDIDATO

    # Upsert the actor's own row.
    own = (
        db.query(Interaccion)
        .filter(
            Interaccion.id_candidato == candidato.id,
            Interaccion.id_vacante == vacante.id,
            Interaccion.actor_role == actor_role,
        )
        .first()
    )
    score = _similarity_for(candidato, vacante)
    if own:
        own.accion = accion
        own.score_similitud = score
    else:
        own = Interaccion(
            id_candidato=candidato.id,
            id_vacante=vacante.id,
            actor_role=actor_role,
            accion=accion,
            score_similitud=score,
        )
        db.add(own)
    db.commit()
    db.refresh(own)

    # Invalidate the actor's cached feed + swiped-set so the swiped item
    # disappears from the next request immediately.
    if actor_role == ROLE_CANDIDATO:
        cache_service.delete(cache_service.swiped_set_key("candidato", candidato.id))
        cache_service.delete_prefix(cache_service.feed_candidato_prefix(candidato.id))
    else:
        cache_service.delete(
            cache_service.swiped_set_key("reclutador", vacante.id_reclutador, vacante.id)
        )
        cache_service.delete_prefix(cache_service.feed_vacante_prefix(vacante.id))

    matched = False
    match_id = None
    if accion == "liked":
        other = (
            db.query(Interaccion)
            .filter(
                Interaccion.id_candidato == candidato.id,
                Interaccion.id_vacante == vacante.id,
                Interaccion.actor_role == other_role,
                Interaccion.accion == "liked",
            )
            .first()
        )
        if other is not None:
            m = _ensure_match(db, candidato_id=candidato.id, vacante=vacante)
            matched = True
            match_id = m.id

    return InteraccionResult(
        status="ok",
        interaccion_id=own.id,
        match=matched,
        match_id=match_id,
    )


@router.post("", response_model=InteraccionResult)
@router.post("/", response_model=InteraccionResult)
def post_interaccion(
    payload: InteraccionIn,
    user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vacante = db.query(Vacante).filter(Vacante.id == payload.vacante_id).first()
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")

    if user.rol == ROLE_CANDIDATO:
        candidato = db.query(Candidato).filter(Candidato.id_usuario == user.id).first()
        if not candidato:
            raise HTTPException(status_code=400, detail="Perfil de candidato no encontrado")
        return _record_swipe(
            db, candidato=candidato, vacante=vacante,
            actor_role=ROLE_CANDIDATO, accion=payload.accion,
        )

    if user.rol == ROLE_RECLUTADOR:
        reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == user.id).first()
        if not reclutador:
            raise HTTPException(status_code=400, detail="Perfil de reclutador no encontrado")
        if vacante.id_reclutador != reclutador.id:
            raise HTTPException(status_code=403, detail="Vacante no pertenece al reclutador")
        if payload.candidato_id is None:
            raise HTTPException(status_code=400, detail="candidato_id requerido para reclutador")
        candidato = db.query(Candidato).filter(Candidato.id == payload.candidato_id).first()
        if not candidato:
            raise HTTPException(status_code=404, detail="Candidato no encontrado")
        return _record_swipe(
            db, candidato=candidato, vacante=vacante,
            actor_role=ROLE_RECLUTADOR, accion=payload.accion,
        )

    raise HTTPException(status_code=403, detail="Rol no soportado")
