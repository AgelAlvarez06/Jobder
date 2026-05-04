from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from database.base import Base

class Candidato(Base):
    __tablename__ = 'candidatos'

    id = Column(BigInteger, primary_key=True)
    id_usuario = Column(BigInteger, ForeignKey('usuarios.id', ondelete='CASCADE'), unique=True)
    nombre = Column(String(255))
    telefono = Column(String(20))
    ubicacion = Column(String(255))
    carrera = Column(String(255))
    habilidades = Column(JSONB)
    idiomas = Column(JSONB)
    descripcion = Column(Text)
    cv_raw_text = Column(Text)
    structured_data = Column(JSONB)
    profile_text = Column(Text, nullable=False)
    embedding_model = Column(String(100))
    fecha_creacion = Column(DateTime, server_default=func.now())
    fecha_actualizacion = Column(DateTime, onupdate=func.now())
    
    
    