from sqlalchemy import Column, BigInteger, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.base import Base


class Mensaje(Base):
    __tablename__ = 'mensajes'

    id = Column(BigInteger, primary_key=True)
    id_match = Column(BigInteger, ForeignKey('matches.id', ondelete='CASCADE'))
    id_remitente = Column(BigInteger, ForeignKey('usuarios.id', ondelete='CASCADE'))
    contenido = Column(Text)
    fecha_envio = Column(DateTime, server_default=func.now())
