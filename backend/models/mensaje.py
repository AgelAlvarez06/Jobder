from sqlalchemy import Column, BigInteger, ForeignKey, DateTime, Text, func
from database.base import Base


class Mensaje(Base):
    __tablename__ = "mensajes"

    id = Column(BigInteger, primary_key=True)
    id_match = Column(BigInteger, ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    id_remitente = Column(BigInteger, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    contenido = Column(Text)
    fecha_envio = Column(DateTime, server_default=func.now())
    read_at = Column(DateTime, nullable=True)
