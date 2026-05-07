"""Helpers for Chroma id namespacing."""
from typing import Optional


CANDIDATO_PREFIX = "candidato_"
VACANTE_PREFIX = "vacante_"


def candidato_id(internal_id: int) -> str:
    return f"{CANDIDATO_PREFIX}{internal_id}"


def vacante_id(internal_id: int) -> str:
    return f"{VACANTE_PREFIX}{internal_id}"


def parse_candidato_id(chroma_id: str) -> Optional[int]:
    if not chroma_id.startswith(CANDIDATO_PREFIX):
        return None
    try:
        return int(chroma_id[len(CANDIDATO_PREFIX):])
    except ValueError:
        return None


def parse_vacante_id(chroma_id: str) -> Optional[int]:
    if not chroma_id.startswith(VACANTE_PREFIX):
        return None
    try:
        return int(chroma_id[len(VACANTE_PREFIX):])
    except ValueError:
        return None