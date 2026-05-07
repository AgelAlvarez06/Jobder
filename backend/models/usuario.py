from sqlalchemy import Column, String, BigInteger, DateTime, func
from database.base import Base

class Usuario(Base):
    __tablename__ = 'usuarios'

    id = Column(BigInteger, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String)
    oauth_provider = Column(String)
    oauth_id = Column(String)
    rol = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())