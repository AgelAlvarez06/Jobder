from sqlalchemy import Column, BigInteger, String, Text, ForeignKey, DateTime, func
from database.base import Base


class Reclutador(Base):
    __tablename__ = 'reclutadores'

    id = Column(BigInteger, primary_key=True, index=True)
    id_usuario = Column(BigInteger,ForeignKey("usuarios.id",ondelete="CASCADE"),unique=True)
    nombre = Column(String)
    nombre_compania = Column(String, nullable=False)
    descripcion_compania = Column(Text)
    fecha_creacion = Column(DateTime, server_default=func.now())
