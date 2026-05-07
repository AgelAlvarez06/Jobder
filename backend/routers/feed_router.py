from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from dependencies.auth import require_candidato
from models.candidato import Candidato
from models.vacante import Vacante
from models.interaccion import Interaccion
from services.gemini_service import generate_embedding
from services.recomendador_service import search_similar
from utils.chroma_ids import vacante_id, parse_vacante_id, VACANTE_PREFIX

router = APIRouter(prefix="/feed", tags=["feed"])


@router.get("/vacantes")
def feed_vacantes(
    top_k: int = 20,
    candidato: Candidato = Depends(require_candidato),
    db: Session = Depends(get_db),
):
    # Exclude only vacantes THIS candidate has already swiped on.
    swiped = [
        row[0]
        for row in db.query(Interaccion.id_vacante)
        .filter(
            Interaccion.id_candidato == candidato.id,
            Interaccion.actor_role == "candidato",
        )
        .all()
    ]
    exclude = [vacante_id(vid) for vid in swiped if vid is not None]

    embedding = generate_embedding(candidato.profile_text or candidato.nombre or "candidato")
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
    return out