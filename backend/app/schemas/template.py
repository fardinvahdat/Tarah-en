
from pydantic import BaseModel
from typing import Optional


class TemplateBase(BaseModel):
    title: str
    category: str
    width: int
    height: int
    image: Optional[str]
    active: Optional[bool] = True


class TemplateCreate(TemplateBase):
    json_dict: str


class TemplateOut(TemplateBase):
    id: int
    creator_id: int

    model_config = {
        "from_attributes": True
    }


class TemplateDetail(TemplateOut):
    json_dict: str
