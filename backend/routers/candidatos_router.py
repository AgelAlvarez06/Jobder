import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from config.settings import GEMINI_EMBEDDING_MODEL
from database.connection import get_db
from dependencies.auth import require_candidato
from models.candidato import Candidato
from services.chroma_service import upsert_embedding
from services.cv_parser import extract_text
from services.gemini_service import generate_embedding
from services.text_builder import build_candidato_profile_text
from utils.chroma_ids import candidato_id

router = APIRouter(prefix="/candidatos", tags=["candidatos"])


def _parse_json(value: Optional[str]):
    if value is None or value == "":
        return None
    try:
        return json.loads(value)
    except Exception:
        # accept comma-separated lists too
        return [v.strip() for v in value.split(",") if v.strip()]


def _serialize(c: Candidato) -> dict:
    return {
        "id": c.id,
        "id_usuario": c.id_usuario,
        "nombre": c.nombre,
        "telefono": c.telefono,
        "ubicacion": c.ubicacion,
        "carrera": c.carrera,
        "habilidades": c.habilidades,
        "idiomas": c.idiomas,
        "descripcion": c.descripcion,
        "structured_data": c.structured_data,
        "profile_text": c.profile_text,
        "embedding_model": c.embedding_model,
    }


@router.get("/me")
def get_me(candidato: Candidato = Depends(require_candidato)):
    return _serialize(candidato)


@router.patch("/me")
async def update_me(
    nombre: Optional[str] = Form(None),
    telefono: Optional[str] = Form(None),
    ubicacion: Optional[str] = Form(None),
    carrera: Optional[str] = Form(None),
    descripcion: Optional[str] = Form(None),
    habilidades: Optional[str] = Form(None),
    idiomas: Optional[str] = Form(None),
    structured_data: Optional[str] = Form(None),
    cv: Optional[UploadFile] = File(None),
    candidato: Candidato = Depends(require_candidato),
    db: Session = Depends(get_db),
):
    if nombre is not None:
        candidato.nombre = nombre
    if telefono is not None:
        candidato.telefono = telefono
    if ubicacion is not None:
        candidato.ubicacion = ubicacion
    if carrera is not None:
        candidato.carrera = carrera
    if descripcion is not None:
        candidato.descripcion = descripcion
    if habilidades is not None:
        candidato.habilidades = _parse_json(habilidades)
    if idiomas is not None:
        candidato.idiomas = _parse_json(idiomas)
    if structured_data is not None:
        sd = _parse_json(structured_data)
        if sd is not None and not isinstance(sd, dict):
            raise HTTPException(status_code=400, detail="structured_data must be a JSON object")
        candidato.structured_data = sd

    if cv is not None:
        try:
            content = await cv.read()
            candidato.cv_raw_text = extract_text(cv.filename or "", content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"CV parse failed: {e}")

    profile_text = build_candidato_profile_text(
        nombre=candidato.nombre,
        carrera=candidato.carrera,
        ubicacion=candidato.ubicacion,
        telefono=candidato.telefono,
        descripcion=candidato.descripcion,
        habilidades=candidato.habilidades,
        idiomas=candidato.idiomas,
        structured_data=candidato.structured_data or {},
        cv_raw_text=candidato.cv_raw_text,
    )
    candidato.profile_text = profile_text
    candidato.embedding_model = GEMINI_EMBEDDING_MODEL
    candidato.fecha_actualizacion = datetime.utcnow()

    db.commit()
    db.refresh(candidato)

    try:
        embedding = generate_embedding(profile_text)
        upsert_embedding(
            id=candidato_id(candidato.id),
            embedding=embedding,
            document=profile_text,
            metadata={"type": "candidato", "candidato_id": candidato.id},
        )
    except Exception as e:
        # Persist but surface the embedding error so the user knows.
        raise HTTPException(status_code=502, detail=f"Embedding failed: {e}")

    return _serialize(candidato)