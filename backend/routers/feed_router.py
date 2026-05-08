from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from dependencies.auth import require_candidato
from models.candidato import Candidato
from models.vacante import Vacante
from models.interaccion import Interaccion
from services import cache_service
from services.chroma_service import get_embedding_by_id
from services.gemini_service import get_or_generate_embedding
from services.recomendador_service import search_similar
from utils.chroma_ids import candidato_id, vacante_id, parse_vacante_id, VACANTE_PREFIX

router = APIRouter(prefix="/feed", tags=["feed"])


@router.get("/vacantes")
def feed_vacantes(
    top_k: int = 20,
    candidato: Candidato = Depends(require_candidato),
    db: Session = Depends(get_db),
):
    # Try the per-candidate feed cache first.
    feed_key = cache_service.feed_candidato_key(candidato.id, top_k)
    cached = cache_service.get_json(feed_key)
    if cached is not None:
        return cached

    # Exclude only vacantes THIS candidate has already swiped on.
    swiped_key = cache_service.swiped_set_key("candidato", candidato.id)
    swiped = cache_service.get_json(swiped_key)
    if swiped is None:
        swiped = [
            row[0]
            for row in db.query(Interaccion.id_vacante)
            .filter(
                Interaccion.id_candidato == candidato.id,
                Interaccion.actor_role == "candidato",
            )
            .all()
        ]
        cache_service.set_json(swiped_key, swiped, ttl=cache_service.SWIPED_CACHE_TTL)
    exclude = [vacante_id(vid) for vid in swiped if vid is not None]

    # Prefer the embedding already stored in Chroma; fall back to (cached) Gemini.
    embedding = get_embedding_by_id(candidato_id(candidato.id))
    if not embedding:
        embedding = get_or_generate_embedding(
            candidato.profile_text or candidato.nombre or "candidato"
        )
    results = search_similar(
        embedding=embedding,
        top_k=top_k,
        id_prefix=VACANTE_PREFIX,
        exclude_ids=exclude,
    )

    parsed_ids = [parse_vacante_id(vid) for vid in results["ids"]]
    parsed_ids = [pid for pid in parsed_ids if pid is not None]
    if not parsed_ids:
        return []

    vacantes = db.query(Vacante).filter(Vacante.id.in_(parsed_ids)).all()
    score_by_id = {
        parse_vacante_id(vid): round(max(0.0, 1.0 - dist) * 100, 2)
        for vid, dist in zip(results["ids"], results["distances"])
    }
    by_id = {v.id: v for v in vacantes}
    out = []
    for pid in parsed_ids:
        v = by_id.get(pid)
        if not v:
            continue
        out.append(
            {
                "id": v.id,
                "id_reclutador": v.id_reclutador,
                "titulo": v.titulo,
                "structured_data": v.structured_data,
                "job_text": v.job_text,
                "score": score_by_id.get(pid, 0.0),
            }
        )
    cache_service.set_json(feed_key, out, ttl=cache_service.FEED_CACHE_TTL)
    return out
