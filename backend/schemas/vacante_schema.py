from pydantic import BaseModel
from typing import Optional, Any

class VacanteCreate(BaseModel):
    titulo: str
    job_text: str
    job_raw_text: Optional[str] = None
    structured_data: Optional[Any] = None


class VacanteUpdate(BaseModel):
    titulo: Optional[str] = None
    job_text: Optional[str] = None
    job_raw_text: Optional[str] = None
    structured_data: Optional[Any] = None


class VacanteOut(BaseModel):
    id: int
    id_reclutador: Optional[int] = None
    titulo: Optional[str] = None
    job_text: Optional[str] = None
    job_raw_text: Optional[str] = None
    structured_data: Optional[Any] = None

    class Config:
        from_attributes = True
