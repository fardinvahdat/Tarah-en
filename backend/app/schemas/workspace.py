from pydantic import BaseModel
from typing import Optional


class WorkspaceBase(BaseModel):
    title: str
    image: str
    height: int
    width: int


class WorkspaceCreate(WorkspaceBase):
    json_dict: str  # Required when creating a workspace


class WorkspaceUpdate(BaseModel):
    title: Optional[str] = None
    image: Optional[str] = None
    height: Optional[int] = None
    width: Optional[int] = None
    json_dict: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


class WorkspaceOut(WorkspaceBase):
    id: int

    model_config = {
        "from_attributes": True
    }


class WorkspaceDetail(WorkspaceOut):
    json_dict: str  # Include the json in the detail view
