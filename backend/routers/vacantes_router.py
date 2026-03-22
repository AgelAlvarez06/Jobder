from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from models.vacante import Vacante
from schemas.vacante_schema import VacanteCreate

from services.gemini_service import generate_embedding
from services.chroma_service import add_embedding
from services.chroma_service import search_embedding

router = APIRouter(prefix='/vacantes')


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post('/')
def create_vacante(data: VacanteCreate, db: Session = Depends(get_db)):
    try:
        vacante = Vacante(
            titulo=data.titulo,
            job_text=data.job_text
        )

        db.add(vacante)
        db.commit()
        db.refresh(vacante)

        # 🔥 NUEVO: embedding + Chroma
        try:
            embedding = generate_embedding(vacante.job_text)

            add_embedding(
                id=f"vacante_{vacante.id}",
                embedding=embedding,
                document=vacante.job_text
            )

        except Exception as e:
            print(f"Error generating embedding for vacante: {e}")

        return {
            'status': 'created',
            'vacante': {
                'id': vacante.id,
                'titulo': vacante.titulo,
                'job_text': vacante.job_text,
            }
        }
    except Exception as e:
        db.rollback()
        print(f"Error al crear vacante: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/')
def list_vacantes(db: Session = Depends(get_db)):
    vacantes = db.query(Vacante).all()
    return [
        {
            'id': v.id,
            'id_reclutador': v.id_reclutador,
            'titulo': v.titulo,
            'job_raw_text': v.job_raw_text,
            'structured_data': v.structured_data,
            'job_text': v.job_text,
            'embedding_model': v.embedding_model,
        }
        for v in vacantes
    ]
    

@router.get('/search/')
def search_vacantes(query: str, db: Session = Depends(get_db)):
    
    query_embedding = generate_embedding(query)

    results = search_embedding(query_embedding)

    vacante_ids = [
        int(id.replace("vacante_", ""))
        for id in results["ids"]
        if id.startswith("vacante_")
    ]

    vacantes = db.query(Vacante).filter(Vacante.id.in_(vacante_ids)).all()

    return vacantes