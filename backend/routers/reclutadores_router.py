from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import get_db, get_current_user
from models.usuario import Usuario
from models.reclutador import Reclutador
from schemas.reclutador_schema import ReclutadorCreate, ReclutadorUpdate, ReclutadorOut

router = APIRouter(prefix='/reclutadores', tags=['reclutadores'])


@router.post('/', response_model=ReclutadorOut)
def create_reclutador(
    data: ReclutadorCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != 'reclutador':
        raise HTTPException(status_code=403, detail="Solo reclutadores pueden crear un perfil de reclutador")

    existing = db.query(Reclutador).filter(Reclutador.id_usuario == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un perfil de reclutador para este usuario")

    reclutador = Reclutador(
        id_usuario=current_user.id,
        nombre=data.nombre,
        nombre_compania=data.nombre_compania,
        descripcion_compania=data.descripcion_compania,
    )
    db.add(reclutador)
    db.commit()
    db.refresh(reclutador)
    return reclutador


@router.get('/me', response_model=ReclutadorOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == current_user.id).first()
    if not reclutador:
        raise HTTPException(status_code=404, detail="Perfil de reclutador no encontrado")
    return reclutador


@router.put('/me', response_model=ReclutadorOut)
def update_my_profile(
    data: ReclutadorUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reclutador = db.query(Reclutador).filter(Reclutador.id_usuario == current_user.id).first()
    if not reclutador:
        raise HTTPException(status_code=404, detail="Perfil de reclutador no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(reclutador, key, value)

    db.commit()
    db.refresh(reclutador)
    return reclutador


@router.get('/{reclutador_id}', response_model=ReclutadorOut)
def get_reclutador(reclutador_id: int, db: Session = Depends(get_db)):
    reclutador = db.query(Reclutador).filter(Reclutador.id == reclutador_id).first()
    if not reclutador:
        raise HTTPException(status_code=404, detail="Reclutador no encontrado")
    return reclutador
