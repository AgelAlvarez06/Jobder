from sqlalchemy import Column, BigInteger, String, Text, DateTime, func
from database.base import Base


class Reclutador(Base):
    __tablename__ = 'reclutadores'

    id = Column(BigInteger, primary_key=True, index=True)
    nombre = Column(String)
    email = Column(String, unique=True)
    nombre_compania = Column(String, nullable=False)
    descripcion_compania = Column(Text)
    fecha_creacion = Column(DateTime, default=func.now()) 
    
