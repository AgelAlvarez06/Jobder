from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import get_db, get_current_user
from models.usuario import Usuario
from schemas.candidato_schema import CandidatoCreate, CandidatoUpdate, CandidatoOut
from services.gemini_service import generate_embedding
from services.chroma_service import add_embedding, search_embedding
from typing import List

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


@router.get('/{candidato_id}', response_model=CandidatoOut)
def get_candidato(candidato_id: int, db: Session = Depends(get_db)):
    candidato = db.query(Candidato).filter(Candidato.id == candidato_id).first()
    if not candidato:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")
    return candidato
