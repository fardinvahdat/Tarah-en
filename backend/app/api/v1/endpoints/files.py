
import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.services.auth import get_current_user
from app.models.user import User
from app.models.file import File as FileModel
from app.schemas.file import FileOut, FileCreate
from app.database import get_db
from app.utils.filebase import uploadFileToFilebase
import asyncio

router = APIRouter()


@router.post("/upload", response_model=FileOut)
async def upload_file(
    file: UploadFile = File(...),
    file_type: str = "upload",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Create a placeholder database record first
        db_file = FileModel(
            user_id=current_user.id,
            type=file_type,
            link="pending"  # Temporary placeholder
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)

        # Start file upload task
        upload_task = asyncio.create_task(uploadFileToFilebase(file))

        # Wait for upload to complete
        upload_result = await upload_task

        # Update the database record with actual URL
        db_file.link = upload_result["url"]
        db.commit()
        db.refresh(db_file)

        return FileOut.from_orm(db_file)

    except Exception as e:
        # Rollback DB changes if error occurs
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading file: {str(e)}"
        )
