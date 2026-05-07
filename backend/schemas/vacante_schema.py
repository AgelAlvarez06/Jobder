from typing import Optional, Any, Dict
from pydantic import BaseModel


class VacanteOut(BaseModel):
    id: int
    id_reclutador: Optional[int] = None
    titulo: Optional[str] = None
    job_raw_text: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None
    job_text: Optional[str] = None
    embedding_model: Optional[str] = None

    class Config:
        from_attributes = True