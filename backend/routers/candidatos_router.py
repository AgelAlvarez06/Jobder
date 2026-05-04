from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import get_db, get_current_user
from models.usuario import Usuario
from models.candidato import Candidato
from schemas.candidato_schema import CandidatoCreate, CandidatoUpdate, CandidatoOut
from services.gemini_service import generate_embedding
from services.chroma_service import add_embedding, search_embedding
from typing import List
#Paul Aun Trabajandolo 
import base64
import io 
from PyPDF2 import PdfReader
from services.gemini_service import generate_embedding, client


router = APIRouter(prefix='/candidatos', tags=['candidatos'])


@router.post('/', response_model=CandidatoOut)
def create_candidato(
    data: CandidatoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != 'candidato':
        raise HTTPException(status_code=403, detail="Solo candidatos pueden crear un perfil")

    existing = db.query(Candidato).filter(Candidato.id_usuario == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un perfil de candidato para este usuario")

    try:
        candidato = Candidato(
            id_usuario=current_user.id,
            nombre=data.nombre,
            profile_text=data.profile_text,
            telefono=data.telefono,
            ubicacion=data.ubicacion,
            carrera=data.carrera,
            habilidades=data.habilidades,
            idiomas=data.idiomas,
            descripcion=data.descripcion,
        )

        db.add(candidato)
        db.commit()
        db.refresh(candidato)

        try:
            embedding = generate_embedding(candidato.profile_text)
            add_embedding(
                id=f"candidato_{candidato.id}",
                embedding=embedding,
                document=candidato.profile_text,
            )
        except Exception as e:
            print(f"Error generating embedding for candidato: {e}")

        return candidato
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/me', response_model=CandidatoOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != 'candidato':
        raise HTTPException(status_code=403, detail="Solo candidatos pueden acceder a este recurso")
    candidato = db.query(Candidato).filter(Candidato.id_usuario == current_user.id).first()
    if not candidato:
        raise HTTPException(status_code=404, detail="Perfil de candidato no encontrado")
    return candidato


@router.put('/me', response_model=CandidatoOut)
def update_my_profile(
    data: CandidatoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != 'candidato':
        raise HTTPException(status_code=403, detail="Solo candidatos pueden acceder a este recurso")
    candidato = db.query(Candidato).filter(Candidato.id_usuario == current_user.id).first()
    if not candidato:
        raise HTTPException(status_code=404, detail="Perfil de candidato no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(candidato, key, value)

    db.commit()
    db.refresh(candidato)

    if 'profile_text' in update_data and candidato.profile_text:
        try:
            embedding = generate_embedding(candidato.profile_text)
            add_embedding(
                id=f"candidato_{candidato.id}",
                embedding=embedding,
                document=candidato.profile_text,
            )
        except Exception as e:
            print(f"Error updating embedding for candidato: {e}")

    return candidato


@router.get('/', response_model=List[CandidatoOut])
def list_candidatos(db: Session = Depends(get_db)):
    candidatos = db.query(Candidato).all()
    return candidatos


@router.get('/search/')
def search_candidatos(query: str, db: Session = Depends(get_db)):
    query_embedding = generate_embedding(query)
    results = search_embedding(query_embedding)
    candidato_ids = [
        int(id.replace("candidato_", ""))
        for id in results["ids"]
        if id.startswith("candidato_")
    ]

    candidatos = db.query(Candidato).filter(Candidato.id.in_(candidato_ids)).all()
    return candidatos

#Paul Aun trbajando

#---
@router.post('/upload-cv')
def upload_cv(data: dict, db: Session = Depends(get_db)):
    try:
        pdf_bytes = base64.b64decode(data['cv_base64'])
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        cv_raw_text = ""
        for page in reader.pages:
            cv_raw_text += page.extract_text() or ""

        if not cv_raw_text.strip():
            raise HTTPException(status_code=400, detail="No se pudo extraer texto del PDF")

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
    
# ----

@router.get('/{candidato_id}', response_model=CandidatoOut)
def get_candidato(candidato_id: int, db: Session = Depends(get_db)):
    candidato = db.query(Candidato).filter(Candidato.id == candidato_id).first()
    if not candidato:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")
    return candidato
