from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from models.vacante import Vacante
from pydantic import BaseModel

from services.recomendador_service import search_similar_jobs

router = APIRouter(prefix='/recommendations')


class RecommendationRequest(BaseModel):
    text: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post('/')
def get_recommendations(request: RecommendationRequest, db: Session = Depends(get_db)):
    
    results = search_similar_jobs(request.text)

    vacantes = db.query(Vacante).filter(
        Vacante.id.in_(results["ids"])
    ).all()

    return [
        {
            "id": v.id,
            "titulo": v.titulo,
            "job_text": v.job_text
        }
        for v in vacantes
    ]