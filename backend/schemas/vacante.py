from sqlalchemy import Column, BigInteger, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from database.base import Base
from models.reclutador import Reclutador

class Vacante(Base):
    __tablename__ = 'vacantes'

    id = Column(BigInteger, primary_key=True)
    id_reclutador = Column(BigInteger, ForeignKey('reclutadores.id', ondelete='CASCADE'))
    titulo = Column(String)
    job_raw_text = Column(Text)
    structured_data = Column(JSONB)
    job_text = Column(Text)
    embedding_model = Column(String)