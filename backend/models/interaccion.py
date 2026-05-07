from sqlalchemy import Column, BigInteger, String, Float, ForeignKey, DateTime, func, UniqueConstraint
from database.base import Base


class Interaccion(Base):
    __tablename__ = "interacciones"
    __table_args__ = (
        UniqueConstraint(
            "id_candidato", "id_vacante", "actor_role", name="uq_candidato_vacante_actor"
        ),
    )

    id = Column(BigInteger, primary_key=True)
    id_candidato = Column(BigInteger, ForeignKey("candidatos.id", ondelete="CASCADE"))
    id_vacante = Column(BigInteger, ForeignKey("vacantes.id", ondelete="CASCADE"))
    actor_role = Column(String, nullable=False)  # 'candidato' | 'reclutador'
    score_similitud = Column(Float)
    accion = Column(String)
    fecha_creacion = Column(DateTime, server_default=func.now())