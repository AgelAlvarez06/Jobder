from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from models.usuario import Usuario
from models.candidato import Candidato
from schemas.candidato_schema import CandidatoCreate
from services.gemini_service import generate_embedding
from services.chroma_service import add_embedding
from services.chroma_service import search_embedding

router = APIRouter(prefix = '/candidatos')

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@router.post('/')
def create_candidato(data: CandidatoCreate, db: Session = Depends(get_db)):
    try:
        candidato = Candidato(
            nombre=data.nombre,
            profile_text=data.profile_text
        )
        
        db.add(candidato)
        db.commit()
        db.refresh(candidato)

        # 1. Generar embedding
        embedding = generate_embedding(candidato.profile_text)

        # 2. Guardar en Chroma
        add_embedding(
            id=f"candidato_{candidato.id}",
            embedding=embedding,
            document=candidato.profile_text
        )

        return {
            'status': 'created',
            'candidato': {
                'id': candidato.id,
                'nombre': candidato.nombre,
                'profile_text': candidato.profile_text,
            }
        }
    except Exception as e:
        db.rollback()
        print(f"Error al crear candidato: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/')
def list_candidatos(db: Session = Depends(get_db)):
    candidatos = db.query(Candidato).all()
    return [
        {
            'id': c.id,
            'id_usuario': c.id_usuario,
            'nombre': c.nombre,
            'telefono': c.telefono,
            'ubicacion': c.ubicacion,
            'carrera': c.carrera,
            'habilidades': c.habilidades,
            'idiomas': c.idiomas,
            'descripcion': c.descripcion,
            'cv_raw_text': c.cv_raw_text,
            'structured_data': c.structured_data,
            'profile_text': c.profile_text,
            'embedding_model': c.embedding_model,
        }
        for c in candidatos
    ]
    

@router.get('/search/')
def search_candidatos(query: str, db: Session = Depends(get_db)):
    
    # 1. Generar embedding del query
    query_embedding = generate_embedding(query)

    # 2. Buscar en Chroma
    results = search_embedding(query_embedding)

    # 3. Extraer IDs de candidatos
    candidato_ids = [
        int(id.replace("candidato_", ""))
        for id in results["ids"]
        if id.startswith("candidato_")
    ]

    # 4. Consultar PostgreSQL
    candidatos = db.query(Candidato).filter(Candidato.id.in_(candidato_ids)).all()

    return candidatos
