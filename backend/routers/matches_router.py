from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from dependencies.auth import get_current_user
from models.candidato import Candidato
from models.match import Match
from models.reclutador import Reclutador
from models.usuario import Usuario
from models.vacante import Vacante

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/")
def list_matches(
    user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.rol == "candidato":
        candidato = db.query(Candidato).filter(Candidato.id_usuario == user.id).first()
        if not candidato:
            return []
        rows = (
            db.query(Match, Vacante, Reclutador)
            .join(Vacante, Vacante.id == Match.id_vacante)
            .join(Reclutador, Reclutador.id == Match.id_reclutador)
            .filter(Match.id_candidato == candidato.id)
            .order_by(Match.fecha_match.desc())
            .all()
        )
        return [
            {
                "id": m.id,
                "vacante": {"id": v.id, "titulo": v.titulo},
                "reclutador": {"id": r.id, "nombre_compania": r.nombre_compania},
                "fecha_match": m.fecha_match.isoformat() if m.fecha_match else None,
            }
            for (m, v, r) in rows
        ]
    elif user.rol == "reclutador":
        recl = db.query(Reclutador).filter(Reclutador.id_usuario == user.id).first()
        if not recl:
            return []
        rows = (
            db.query(Match, Vacante, Candidato)
            .join(Vacante, Vacante.id == Match.id_vacante)
            .join(Candidato, Candidato.id == Match.id_candidato)
            .filter(Match.id_reclutador == recl.id)
            .order_by(Match.fecha_match.desc())
            .all()
        )
        return [
            {
                "id": m.id,
                "vacante": {"id": v.id, "titulo": v.titulo},
                "candidato": {"id": c.id, "nombre": c.nombre, "carrera": c.carrera},
                "fecha_match": m.fecha_match.isoformat() if m.fecha_match else None,
            }
            for (m, v, c) in rows
        ]
    return []