from sqlalchemy import Column, BigInteger, String
from database.base import Base


class Reclutador(Base):
    __tablename__ = 'reclutadores'

    id = Column(BigInteger, primary_key=True, index=True)
    nombre = Column(String)
    email = Column(String, unique=True)
