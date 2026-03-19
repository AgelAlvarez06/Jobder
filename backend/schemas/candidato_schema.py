from pydantic import BaseModel

class CandidatoCreate(BaseModel):
    nombre: str
    profile_text: str