
from pydantic import BaseModel
from typing import Optional


class FileBase(BaseModel):
    id: int
    link: str
    type: str

    model_config = {
        "from_attributes": True
    }


class FileCreate(BaseModel):
    link: str
    type: str


class FileOut(FileBase):
    pass
