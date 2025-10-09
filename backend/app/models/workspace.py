
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    image = Column(Text)  # Changed to Text to handle large base64 strings
    height = Column(Integer)
    width = Column(Integer)
    json_dict = Column(Text)  # Store long JSON string for fabric.js workspace
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="workspaces")
