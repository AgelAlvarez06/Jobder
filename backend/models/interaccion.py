from sqlalchemy import Column, BigInteger, Float, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database.base import Base


class Interaccion(Base):
    __tablename__ = 'interacciones'

    id = Column(BigInteger, primary_key=True)
    id_candidato = Column(BigInteger, ForeignKey('candidatos.id', ondelete='CASCADE'))
    id_vacante = Column(BigInteger, ForeignKey('vacantes.id', ondelete='CASCADE'))
    score_similitud = Column(Float)
    accion = Column(String(20))
    fecha_creacion = Column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint('id_candidato', 'id_vacante', name='uq_interaccion_candidato_vacante'),
    )
