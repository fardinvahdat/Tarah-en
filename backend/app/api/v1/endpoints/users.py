
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.user import UserCreate, UserInDB, UserBase, RoleChangeRequest
from app.schemas.file import FileOut
from app.models.user import User, UserRole, RoleChangeRequestModel
from app.models.file import File
from app.models.template import Template
from app.database import get_db
from app.utils.security import get_password_hash
from app.services.auth import get_current_user
from app.services import template as template_service
from app.services import workspace as workspace_service
from app.schemas.workspace import WorkspaceCreate, WorkspaceOut, WorkspaceDetail, WorkspaceUpdate
from app.schemas.template import TemplateOut
from app.services.workspace import create_workspace, get_user_workspaces, get_workspace_detail

router = APIRouter()


@router.post("/", response_model=UserInDB)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role or "user"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/me", response_model=UserBase)
def read_users_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_data = UserBase.from_orm(current_user)
    user_data.workspaces = [WorkspaceOut.from_orm(
        ws) for ws in get_user_workspaces(db, current_user.id)]
    user_data.templates = [TemplateOut.from_orm(
        ws) for ws in template_service.get_templates_by_user(db, current_user.id)]
    
    # Get user files
    user_files = db.query(File).filter(File.user_id == current_user.id).all()
    user_data.files = [FileOut.from_orm(file) for file in user_files]

    # Check if user has a pending role change request
    request_exists = db.query(RoleChangeRequestModel).filter(
        RoleChangeRequestModel.user_id == current_user.id,
        RoleChangeRequestModel.status == "pending"
    ).first() is not None

    # Return enriched response
    return {
        **user_data.dict(),
        "role_change_requested": request_exists
    }


@router.get("/admin", response_model=List[UserBase])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    users = db.query(User).all()
    return [
        UserBase(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            mobile=user.mobile,
            role=user.role.value,
            templates=[],
            workspaces=[],
            files=[],
            role_change_requested=False
        )
        for user in users
    ]


@router.patch("/admin/{user_id}/role")
async def change_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    if new_role not in ["admin", "designer", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = new_role
    db.commit()
    
    return {"message": f"User role updated to {new_role}"}


@router.get("/admin/{user_id}/templates", response_model=List[TemplateOut])
async def get_user_templates(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    templates = template_service.get_templates_by_user(db, user_id)
    return [TemplateOut.from_orm(template) for template in templates]


@router.delete("/admin/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}


# ... keep existing code (workspace endpoints, role change endpoints) the same


@router.get("/me/workspaces/{workspace_id}", response_model=WorkspaceDetail)
async def get_workspace_details(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspace = get_workspace_detail(db, workspace_id)
    if workspace is None or workspace.user_id != current_user.id:
        raise HTTPException(
            status_code=404, detail="Workspace not found or unauthorized")
    return WorkspaceDetail.from_orm(workspace)


@router.post("/me/workspaces", response_model=WorkspaceOut)
async def create_workspace_for_user(
    workspace: WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_workspace(db, workspace, current_user.id)


@router.patch("/me/workspaces/{workspace_id}", response_model=WorkspaceDetail)
async def update_workspace(
    workspace_id: int,
    workspace_update: WorkspaceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_workspace = workspace_service.update_workspace(
        db=db,
        workspace_id=workspace_id,
        user_id=current_user.id,
        update_data=workspace_update
    )

    if not updated_workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found or you don't have permission"
        )

    return updated_workspace


@router.post("/request-role-change")
async def request_role_change(
    payload: RoleChangeRequest,
    db: Session = Depends(get_db),
    # User who wants to request role change
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.user:
        raise HTTPException(
            status_code=400, detail="Only users can request a role change")

    if payload.requested_role not in [UserRole.designer, UserRole.admin]:
        raise HTTPException(status_code=400, detail="Invalid requested role")

    # Create the role change request in the database or temp store
    role_request = db.query(RoleChangeRequestModel).filter(
        RoleChangeRequestModel.user_id == current_user.id).first()
    if role_request:
        raise HTTPException(
            status_code=400, detail="You already have a pending role change request")

    new_request = RoleChangeRequestModel(
        user_id=current_user.id,
        requested_role=payload.requested_role,
        status="pending"  # Pending status
    )
    db.add(new_request)
    db.commit()
    return {"message": "Your request has been submitted"}


@router.get("/role-change-requests")
async def get_role_change_requests(
    db: Session = Depends(get_db),
    # Current logged-in user (should be admin)
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=403, detail="You are not authorized to view this")

    # Fetch all pending requests
    requests = db.query(RoleChangeRequestModel).filter(
        RoleChangeRequestModel.status == "pending").all()
    return requests


@router.post("/approve-role-change/{request_id}")
async def approve_role_change(
    request_id: int,
    action: str,  # "approve" or "decline"
    db: Session = Depends(get_db),
    # Current logged-in user (should be admin)
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=403, detail="You are not authorized to approve requests")

    # Fetch the request
    role_change_request = db.query(RoleChangeRequestModel).filter(
        RoleChangeRequestModel.id == request_id).first()

    if not role_change_request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Handle approve or decline
    if action == "approve":
        user_to_update = db.query(User).filter(
            User.id == role_change_request.user_id).first()
        if user_to_update:
            user_to_update.role = role_change_request.requested_role
            db.commit()
        role_change_request.status = "approved"
    elif action == "decline":
        role_change_request.status = "declined"
    else:
        raise HTTPException(
            status_code=400, detail="Invalid action. Use 'approve' or 'decline'")

    db.commit()
    return {"message": f"Role change request {action}d successfully"}
