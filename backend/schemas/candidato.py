from sqlalchemy import Column, BigInteger, String, Text, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from database.base import Base

class Candidato(Base):
    __tablename__ = 'candidatos'

    id = Column(BigInteger, primary_key = True)
    id_usuario = Column(BigInteger, ForeignKey('usuarios.id', ondelete = 'CASCADE'))
    nombre = Column(String)
    telefono = Column(String)
    ubicacion = Column(String)
    carrera = Column(String)
    habilidades = Column(JSONB)
    idiomas = Column(JSONB)
    descripcion = Column(Text)
    cv_raw_text = Column(Text)
    structured_data = Column(JSONB)
    profile_text = Column(Text)
    embedding_model = Column(String)
    fecha_creacion = Column(DateTime, default=func.now()) 
    fecha_actualizacion = Column(DateTime, default=func.now(), onupdate=func.now())
    
    
    