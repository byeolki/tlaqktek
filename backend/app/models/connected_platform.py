from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class ConnectedPlatform(Base):
    __tablename__ = "connected_platforms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform_name = Column(String, nullable=False) # joongna or bunjang
    platform_user_id = Column(String, nullable=False)
    encrypted_password = Column(Text, nullable=False)

    user = relationship("User", back_populates="connected_platforms")
