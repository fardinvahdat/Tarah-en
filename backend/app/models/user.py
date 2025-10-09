
from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"
    designer = "designer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    mobile = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=True)

    templates = relationship("Template", back_populates="creator")
    workspaces = relationship(
        "Workspace", back_populates="user", cascade="all, delete-orphan")
    role_change_requests = relationship(
        "RoleChangeRequestModel", back_populates="user")
    files = relationship("File", back_populates="user", cascade="all, delete-orphan")


class RoleChangeRequestModel(Base):
    __tablename__ = 'role_change_requests'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    requested_role = Column(String)
    status = Column(String, default="pending")

    user = relationship("User", back_populates="role_change_requests")
