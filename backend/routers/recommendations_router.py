"""Legacy free-text recommendations endpoint, kept for backwards compatibility.

The real swipe feed lives in `feed_router.py` and is scoped to the current
authenticated candidato.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.connection import get_db
from models.vacante import Vacante
from services.gemini_service import generate_embedding
from services.recomendador_service import search_similar
from utils.chroma_ids import VACANTE_PREFIX, parse_vacante_id

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


class RecommendationRequest(BaseModel):
    text: str


@router.post("/")
def get_recommendations(req: RecommendationRequest, db: Session = Depends(get_db)):
    embedding = generate_embedding(req.text)
    results = search_similar(embedding=embedding, top_k=5, id_prefix=VACANTE_PREFIX)
    ids = [parse_vacante_id(cid) for cid in results["ids"]]
    ids = [i for i in ids if i is not None]
    if not ids:
        return []
    vacantes = db.query(Vacante).filter(Vacante.id.in_(ids)).all()
    score_by_id = {
        parse_vacante_id(cid): round(max(0.0, 1.0 - dist) * 100, 2)
        for cid, dist in zip(results["ids"], results["distances"])
    }
    by_id = {v.id: v for v in vacantes}
    out = []
    for vid in ids:
        v = by_id.get(vid)
        if not v:
            continue
        out.append({
            "id": v.id,
            "titulo": v.titulo,
            "job_text": v.job_text,
            "score": score_by_id.get(vid, 0.0),
        })
    return out