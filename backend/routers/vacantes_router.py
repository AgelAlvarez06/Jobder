import json
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from config.settings import GEMINI_EMBEDDING_MODEL
from database.connection import get_db
from dependencies.auth import require_reclutador, get_current_user
from models.reclutador import Reclutador
from models.usuario import Usuario
from models.vacante import Vacante
from models.candidato import Candidato
from models.interaccion import Interaccion
from services import cache_service
from services.chroma_service import upsert_embedding, delete_embedding, get_embedding_by_id
from services.cv_parser import extract_text
from services.gemini_service import get_or_generate_embedding
from services.recomendador_service import search_similar
from services.text_builder import build_vacante_job_text
from utils.chroma_ids import vacante_id, candidato_id, parse_candidato_id, CANDIDATO_PREFIX

router = APIRouter(prefix="/vacantes", tags=["vacantes"])


def _parse_json(value: Optional[str]):
    if value is None or value == "":
        return None
    try:
        return json.loads(value)
    except Exception:
        return None


def _serialize(v: Vacante) -> dict:
    return {
        "id": v.id,
        "id_reclutador": v.id_reclutador,
        "titulo": v.titulo,
        "job_raw_text": v.job_raw_text,
        "structured_data": v.structured_data,
        "job_text": v.job_text,
        "embedding_model": v.embedding_model,
    }


def _embed_and_store(vacante: Vacante):
    embedding = get_or_generate_embedding(vacante.job_text)
    upsert_embedding(
        id=vacante_id(vacante.id),
        embedding=embedding,
        document=vacante.job_text,
        metadata={
            "type": "vacante",
            "vacante_id": vacante.id,
            "id_reclutador": vacante.id_reclutador,
        },
    )


@router.get("/")
def list_my_vacantes(
    reclutador: Reclutador = Depends(require_reclutador),
    db: Session = Depends(get_db),
):
    vacs = (
        db.query(Vacante)
        .filter(Vacante.id_reclutador == reclutador.id)
        .order_by(Vacante.id.desc())
        .all()
    )
    return [_serialize(v) for v in vacs]


@router.post("/")
async def create_vacante(
    titulo: str = Form(...),
    structured_data: Optional[str] = Form(None),
    job_raw_text: Optional[str] = Form(None),
    job_description: Optional[UploadFile] = File(None),
    reclutador: Reclutador = Depends(require_reclutador),
    db: Session = Depends(get_db),
):
    sd = _parse_json(structured_data) if structured_data else None
    raw = job_raw_text or ""
    if job_description is not None:
        try:
            content = await job_description.read()
            raw = (raw + "\n" + extract_text(job_description.filename or "", content)).strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"job_description parse failed: {e}")

    job_text = build_vacante_job_text(
        titulo=titulo,
        structured_data=sd or {},
        job_raw_text=raw,
        nombre_compania=reclutador.nombre_compania,
    )

    vacante = Vacante(
        id_reclutador=reclutador.id,
        titulo=titulo,
        job_raw_text=raw or None,
        structured_data=sd,
        job_text=job_text,
        embedding_model=GEMINI_EMBEDDING_MODEL,
    )
    db.add(vacante)
    db.commit()
    db.refresh(vacante)

    try:
        _embed_and_store(vacante)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Embedding failed: {e}")

    # New vacante invalidates every candidate's feed cache (it's a new option).
    cache_service.delete_prefix(cache_service._k("feed", "cand"))
    return _serialize(vacante)


def _get_owned(db: Session, vacante_id_int: int, reclutador: Reclutador) -> Vacante:
    v = db.query(Vacante).filter(Vacante.id == vacante_id_int).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    if v.id_reclutador != reclutador.id:
        raise HTTPException(status_code=403, detail="No autorizado")
    return v


@router.get("/{vacante_id_int}")
def get_vacante(
    vacante_id_int: int,
    reclutador: Reclutador = Depends(require_reclutador),
    db: Session = Depends(get_db),
):
    return _serialize(_get_owned(db, vacante_id_int, reclutador))


@router.patch("/{vacante_id_int}")
async def update_vacante(
    vacante_id_int: int,
    titulo: Optional[str] = Form(None),
    structured_data: Optional[str] = Form(None),
    job_raw_text: Optional[str] = Form(None),
    job_description: Optional[UploadFile] = File(None),
    reclutador: Reclutador = Depends(require_reclutador),
    db: Session = Depends(get_db),
):
    v = _get_owned(db, vacante_id_int, reclutador)

    if titulo is not None:
        v.titulo = titulo
    if structured_data is not None:
        v.structured_data = _parse_json(structured_data) or {}
    if job_raw_text is not None:
        v.job_raw_text = job_raw_text
    if job_description is not None:
        try:
            content = await job_description.read()
            extra = extract_text(job_description.filename or "", content)
            v.job_raw_text = ((v.job_raw_text or "") + "\n" + extra).strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"job_description parse failed: {e}")

    v.job_text = build_vacante_job_text(
        titulo=v.titulo,
        structured_data=v.structured_data or {},
        job_raw_text=v.job_raw_text,
        nombre_compania=reclutador.nombre_compania,
    )
    v.embedding_model = GEMINI_EMBEDDING_MODEL
    v.fecha_actualizacion = datetime.utcnow()
    db.commit()
    db.refresh(v)

    try:
        _embed_and_store(v)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Embedding failed: {e}")

    # Vacante text changed → its candidates feed and every candidato feed are stale.
    cache_service.delete_prefix(cache_service.feed_vacante_prefix(v.id))
    cache_service.delete_prefix(cache_service._k("feed", "cand"))
    return _serialize(v)


@router.delete("/{vacante_id_int}")
def delete_vacante(
    vacante_id_int: int,
    reclutador: Reclutador = Depends(require_reclutador),
    db: Session = Depends(get_db),
):
    v = _get_owned(db, vacante_id_int, reclutador)
    delete_embedding(vacante_id(v.id))
    db.delete(v)
    db.commit()
    cache_service.delete_prefix(cache_service.feed_vacante_prefix(vacante_id_int))
    cache_service.delete_prefix(cache_service._k("feed", "cand"))
    return {"status": "deleted", "id": vacante_id_int}


@router.get("/{vacante_id_int}/candidatos")
def candidatos_for_vacante(
    vacante_id_int: int,
    top_k: int = 20,
    reclutador: Reclutador = Depends(require_reclutador),
    db: Session = Depends(get_db),
):
    v = _get_owned(db, vacante_id_int, reclutador)

    feed_key = cache_service.feed_vacante_candidatos_key(v.id, top_k)
    cached = cache_service.get_json(feed_key)
    if cached is not None:
        return cached

    # Already swiped by THIS recruiter for THIS vacante (recruiter-side rows only).
    swiped_key = cache_service.swiped_set_key("reclutador", reclutador.id, v.id)
    swiped_candidato_ids = cache_service.get_json(swiped_key)
    if swiped_candidato_ids is None:
        swiped_candidato_ids = [
            row[0]
            for row in db.query(Interaccion.id_candidato)
            .filter(
                Interaccion.id_vacante == v.id,
                Interaccion.actor_role == "reclutador",
            )
            .all()
        ]
        cache_service.set_json(
            swiped_key, swiped_candidato_ids, ttl=cache_service.SWIPED_CACHE_TTL
        )
    exclude = [candidato_id(cid) for cid in swiped_candidato_ids if cid is not None]

    # Prefer the embedding stored in Chroma; fall back to (cached) Gemini.
    embedding = get_embedding_by_id(vacante_id(v.id))
    if not embedding:
        embedding = get_or_generate_embedding(v.job_text)
    results = search_similar(
        embedding=embedding,
        top_k=top_k,
        id_prefix=CANDIDATO_PREFIX,
        exclude_ids=exclude,
    )

    parsed_ids = [parse_candidato_id(cid) for cid in results["ids"]]
    parsed_ids = [pid for pid in parsed_ids if pid is not None]
    if not parsed_ids:
        return []

    candidatos = (
        db.query(Candidato).filter(Candidato.id.in_(parsed_ids)).all()
    )
    score_by_id = {
        parse_candidato_id(cid): round(max(0.0, 1.0 - dist) * 100, 2)
        for cid, dist in zip(results["ids"], results["distances"])
    }
    by_id = {c.id: c for c in candidatos}
    out = []
    for pid in parsed_ids:
        c = by_id.get(pid)
        if not c:
            continue
        out.append(
            {
                "id": c.id,
                "nombre": c.nombre,
                "carrera": c.carrera,
                "ubicacion": c.ubicacion,
                "habilidades": c.habilidades,
                "idiomas": c.idiomas,
                "descripcion": c.descripcion,
                "score": score_by_id.get(pid, 0.0),
            }
        )
    cache_service.set_json(feed_key, out, ttl=cache_service.FEED_CACHE_TTL)
    return out
