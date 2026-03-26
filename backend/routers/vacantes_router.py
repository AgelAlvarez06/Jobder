from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import get_db, get_current_user
from models.usuario import Usuario
from models.reclutador import Reclutador
from models.vacante import Vacante
from models.interaccion import Interaccion
from schemas.vacante_schema import VacanteCreate, VacanteUpdate, VacanteOut

from services.gemini_service import generate_embedding
from services.chroma_service import add_embedding, search_embedding
from typing import List

router = APIRouter(prefix='/vacantes', tags=['vacantes'])


@router.post('/', response_model=VacanteOut)
def create_vacante(
    data: VacanteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != 'reclutador':
        raise HTTPException(status_code=403, detail="Solo reclutadores pueden crear vacantes")

    reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == current_user.id).first()
    if not reclutador:
        raise HTTPException(status_code=404, detail="Debes crear tu perfil de reclutador primero")

    try:
        vacante = Vacante(
            id_reclutador=reclutador.id,
            titulo=data.titulo,
            job_text=data.job_text,
            job_raw_text=data.job_raw_text,
            structured_data=data.structured_data,
        )

        db.add(vacante)
        db.commit()
        db.refresh(vacante)

        try:
            embedding = generate_embedding(vacante.job_text)

            add_embedding(
                id=f"vacante_{vacante.id}",
                embedding=embedding,
                document=vacante.job_text,
            )
        except Exception as e:
            print(f"Error generating embedding for vacante: {e}")

        return vacante
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/', response_model=List[VacanteOut])
def list_vacantes(db: Session = Depends(get_db)):
    vacantes = db.query(Vacante).all()
    return vacantes


@router.get('/mine', response_model=List[VacanteOut])
def list_my_vacantes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == current_user.id).first()
    if not reclutador:
        return []
    vacantes = db.query(Vacante).filter(Vacante.id_reclutador == reclutador.id).all()
    return vacantes


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


@router.get('/{vacante_id}', response_model=VacanteOut)
def get_vacante(vacante_id: int, db: Session = Depends(get_db)):
    vacante = db.query(Vacante).filter(Vacante.id == vacante_id).first()
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante


@router.put('/{vacante_id}', response_model=VacanteOut)
def update_vacante(
    vacante_id: int,
    data: VacanteUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != 'reclutador':
        raise HTTPException(status_code=403, detail="Solo reclutadores pueden editar vacantes")

    reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == current_user.id).first()
    if not reclutador:
        raise HTTPException(status_code=404, detail="Perfil de reclutador no encontrado")

    vacante = db.query(Vacante).filter(
        Vacante.id == vacante_id,
        Vacante.id_reclutador == reclutador.id,
    ).first()
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada o no pertenece al reclutador")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(vacante, key, value)

    db.commit()
    db.refresh(vacante)

    if 'job_text' in update_data and vacante.job_text:
        try:
            embedding = generate_embedding(vacante.job_text)
            add_embedding(
                id=f"vacante_{vacante.id}",
                embedding=embedding,
                document=vacante.job_text,
            )
        except Exception as e:
            print(f"Error updating embedding for vacante: {e}")

    return vacante


@router.delete('/{vacante_id}')
def delete_vacante(
    vacante_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != 'reclutador':
        raise HTTPException(status_code=403, detail="Solo reclutadores pueden eliminar vacantes")

    reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == current_user.id).first()
    if not reclutador:
        raise HTTPException(status_code=404, detail="Perfil de reclutador no encontrado")

    vacante = db.query(Vacante).filter(
        Vacante.id == vacante_id,
        Vacante.id_reclutador == reclutador.id,
    ).first()
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada o no pertenece al reclutador")

    db.delete(vacante)
    db.commit()
    return {"status": "deleted", "id": vacante_id}


@router.get('/{vacante_id}/candidates')
def get_vacancy_candidates(
    vacante_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    from models.candidato import Candidato

    if current_user.rol != 'reclutador':
        raise HTTPException(status_code=403, detail="Solo reclutadores pueden ver candidatos")

    reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == current_user.id).first()
    if not reclutador:
        raise HTTPException(status_code=404, detail="Perfil de reclutador no encontrado")

    vacante = db.query(Vacante).filter(
        Vacante.id == vacante_id,
        Vacante.id_reclutador == reclutador.id,
    ).first()
    if not vacante:
        raise HTTPException(status_code=404, detail="Vacante no encontrada o no pertenece al reclutador")

    interacciones = db.query(Interaccion).filter(
        Interaccion.id_vacante == vacante_id,
        Interaccion.accion == 'liked',
    ).all()

    results = []
    for inter in interacciones:
        candidato = db.query(Candidato).filter(Candidato.id == inter.id_candidato).first()
        if candidato:
            results.append({
                "id": candidato.id,
                "nombre": candidato.nombre,
                "carrera": candidato.carrera,
                "ubicacion": candidato.ubicacion,
                "habilidades": candidato.habilidades,
                "score_similitud": inter.score_similitud,
                "accion": inter.accion,
            })

    return results