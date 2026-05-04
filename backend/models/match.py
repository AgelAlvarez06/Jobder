from sqlalchemy import Column, BigInteger, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.base import Base


class Match(Base):
    __tablename__ = 'matches'

    id = Column(BigInteger, primary_key=True)
    id_candidato = Column(BigInteger, ForeignKey('candidatos.id', ondelete='CASCADE'))
    id_vacante = Column(BigInteger, ForeignKey('vacantes.id', ondelete='CASCADE'))
    id_reclutador = Column(BigInteger, ForeignKey('reclutadores.id', ondelete='CASCADE'))
    fecha_match = Column(DateTime, server_default=func.now())
