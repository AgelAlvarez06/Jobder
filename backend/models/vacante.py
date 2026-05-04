from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from database.base import Base

class Vacante(Base):
    __tablename__ = 'vacantes'

    id = Column(BigInteger, primary_key=True)
    id_reclutador = Column(BigInteger, ForeignKey('reclutadores.id', ondelete='CASCADE'))
    titulo = Column(String(255))
    job_raw_text = Column(Text)
    structured_data = Column(JSONB)
    job_text = Column(Text, nullable=False)
    embedding_model = Column(String(100))
    fecha_creacion = Column(DateTime, server_default=func.now())
    fecha_actualizacion = Column(DateTime, onupdate=func.now())