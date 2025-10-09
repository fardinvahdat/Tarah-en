
from pydantic import BaseModel
from typing import Optional, List
from app.schemas.file import FileOut


class Token(BaseModel):
    access_token: str
    token_type: str


class UserBase(BaseModel):
    id: int
    full_name: Optional[str]
    email: Optional[str]
    mobile: str
    role: str
    templates: Optional[list] = []
    workspaces: Optional[list] = []
    files: Optional[List[FileOut]] = []
    role_change_requested: Optional[bool] = False

    model_config = {
        "from_attributes": True
    }


class UserCreate(BaseModel):
    full_name: str
    email: Optional[str]
    mobile: str
    password: Optional[str]
    role: Optional[str] = "user"


class UserInDB(UserBase):
    pass


class MobileLoginRequest(BaseModel):
    mobile: str
    code: str


class OTPRequest(BaseModel):
    mobile: str


class RoleChangeRequest(BaseModel):
    requested_role: str
