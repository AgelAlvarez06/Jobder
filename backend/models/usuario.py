from sqlalchemy import Column, String, BigInteger, DateTime
from sqlalchemy.sql import func
from database.base import Base

class Usuario(Base):
    __tablename__ = 'usuarios'

    id = Column(BigInteger, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String, nullable=True)
    oauth_provider = Column(String(50), nullable=True)
    oauth_id = Column(String(255), nullable=True)
    rol = Column(String(20), nullable=False)
    created_at = Column(DateTime, server_default=func.now())