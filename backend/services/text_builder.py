"""Build the canonical embedding text for candidates / vacancies."""
from typing import Optional, Iterable


def _join_list(value) -> str:
    if not value:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, (list, tuple)):
        return ", ".join(str(v) for v in value if v)
    return str(value)


def build_candidato_profile_text(
    *,
    nombre: Optional[str],
    carrera: Optional[str],
    ubicacion: Optional[str],
    telefono: Optional[str],
    descripcion: Optional[str],
    habilidades=None,
    idiomas=None,
    structured_data: Optional[dict] = None,
    cv_raw_text: Optional[str] = None,
) -> str:
    parts = []
    if nombre:
        parts.append(f"Nombre: {nombre}.")
    if carrera:
        parts.append(f"Carrera: {carrera}.")
    if ubicacion:
        parts.append(f"Ubicación: {ubicacion}.")
    if telefono:
        parts.append(f"Teléfono: {telefono}.")
    skills = _join_list(habilidades)
    if skills:
        parts.append(f"Habilidades: {skills}.")
    langs = _join_list(idiomas)
    if langs:
        parts.append(f"Idiomas: {langs}.")
    if descripcion:
        parts.append(f"Descripción: {descripcion}")
    if structured_data:
        for k, v in structured_data.items():
            if v in (None, "", [], {}):
                continue
            parts.append(f"{k}: {_join_list(v) if isinstance(v, (list, tuple)) else v}")
    structured_text = " ".join(parts).strip()

    cv_text = (cv_raw_text or "").strip()
    if cv_text:
        return f"{structured_text}\n\nCV:\n{cv_text}".strip()
    return structured_text or "Sin información"


def build_vacante_job_text(
    *,
    titulo: Optional[str],
    structured_data: Optional[dict] = None,
    job_raw_text: Optional[str] = None,
    nombre_compania: Optional[str] = None,
) -> str:
    parts = []
    if titulo:
        parts.append(f"Puesto: {titulo}.")
    if nombre_compania:
        parts.append(f"Empresa: {nombre_compania}.")
    if structured_data:
        for k, v in structured_data.items():
            if v in (None, "", [], {}):
                continue
            parts.append(f"{k}: {_join_list(v) if isinstance(v, (list, tuple)) else v}")
    structured_text = " ".join(parts).strip()

    raw = (job_raw_text or "").strip()
    if raw:
        return f"{structured_text}\n\nDescripción:\n{raw}".strip()
    return structured_text or "Sin información"
