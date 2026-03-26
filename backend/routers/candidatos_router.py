from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from models.usuario import Usuario
from models.candidato import Candidato
from schemas.candidato_schema import CandidatoCreate
from services.gemini_service import generate_embedding
from services.chroma_service import add_embedding
from services.chroma_service import search_embedding
import base64
import io
from PyPDF2 import PdfReader


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


@router.post('/upload-cv')
def upload_cv(data: dict, db: Session = Depends(get_db)):
    try:
        # 1. Decodificar base64 a PDF
        pdf_bytes = base64.b64decode(data['cv_base64'])
        pdf_file = io.BytesIO(pdf_bytes)
        
        # 2. Extraer texto del PDF
        reader = PdfReader(pdf_file)
        cv_raw_text = ""
        for page in reader.pages:
            cv_raw_text += page.extract_text() or ""

        if not cv_raw_text.strip():
            raise HTTPException(status_code=400, detail="No se pudo extraer texto del PDF")

        # 3. Mandar a Gemini para estructurar
        prompt = f"""
        Eres un extractor de información de CVs. 
        Del siguiente CV extrae esta información en formato JSON:
        - nombre
        - habilidades (lista)
        - carrera
        - ubicacion
        - idiomas (lista)
        - salario_esperado
        - modalidad (remoto/presencial/híbrido)
        - descripcion (resumen breve del perfil)
        - profile_text (texto completo para búsqueda semántica)

        CV:
        {cv_raw_text}

        Responde SOLO con el JSON, sin texto adicional ni backticks.
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        import json
        structured = json.loads(response.text)

        # 4. Crear candidato en DB
        candidato = Candidato(
            nombre=structured.get('nombre', data.get('nombre', 'Sin nombre')),
            cv_raw_text=cv_raw_text,
            structured_data=json.dumps(structured),
            profile_text=structured.get('profile_text', cv_raw_text),
            habilidades=str(structured.get('habilidades', [])),
            carrera=structured.get('carrera', ''),
            ubicacion=structured.get('ubicacion', ''),
            idiomas=str(structured.get('idiomas', [])),
            descripcion=structured.get('descripcion', ''),
        )

        db.add(candidato)
        db.commit()
        db.refresh(candidato)

        # 5. Generar embedding y guardar en Chroma
        embedding = generate_embedding(candidato.profile_text)
        add_embedding(
            id=f"candidato_{candidato.id}",
            embedding=embedding,
            document=candidato.profile_text
        )

        return {
            'status': 'created',
            'candidato_id': candidato.id,
            'structured_data': structured
        }

    except Exception as e:
        db.rollback()
        print(f"Error al procesar CV: {e}")
        raise HTTPException(status_code=500, detail=str(e))