from pydantic import BaseModel

class VacanteCreate(BaseModel):
    titulo: str
    job_text: str