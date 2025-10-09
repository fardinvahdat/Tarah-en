from sqlalchemy.orm import Session
from app.models.workspace import Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate
from app.models.user import User


def create_workspace(db: Session, workspace_data: WorkspaceCreate, user_id: int):
    workspace = Workspace(**workspace_data.dict(), user_id=user_id)
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace


def update_workspace(
    db: Session,
    workspace_id: int,
    user_id: int,
    update_data: WorkspaceUpdate
):
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == user_id
    ).first()

    if not workspace:
        return None

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(workspace, field, value)

    db.commit()
    db.refresh(workspace)
    return workspace


def get_user_workspaces(db: Session, user_id: int):
    return db.query(Workspace).filter(Workspace.user_id == user_id).all()


def get_workspace_detail(db: Session, workspace_id: int):
    return db.query(Workspace).filter(Workspace.id == workspace_id).first()
