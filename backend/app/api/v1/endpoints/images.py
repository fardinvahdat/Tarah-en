
import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.services.auth import get_current_user
from app.models.user import User
from app.models.file import File as FileModel
from app.schemas.file import FileOut, FileCreate
from app.schemas.user import UserInDB
from app.utils.image_processing import enhance_image
from app.utils.remove_bg import remove_background
from app.utils.filebase import uploadFileToFilebase
from app.database import get_db

router = APIRouter()


@router.post("/enhance", response_model=FileOut)
async def enhance_user_image(
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create temp directory if it doesn't exist
    os.makedirs("temp_images", exist_ok=True)

    temp_path = f"temp_images/temp_{uuid.uuid4()}.jpg"
    result_path = f"temp_images/enhanced_{uuid.uuid4()}.png"

    try:
        # Save uploaded file
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Process image
        success = await enhance_image(temp_path, result_path)
        if not success or not os.path.exists(result_path):
            raise HTTPException(
                status_code=500,
                detail="Failed to process image"
            )

        # Create a file object for upload to local storage
        with open(result_path, "rb") as enhanced_file:
            # Create a mock UploadFile object for the enhanced image
            class MockUploadFile:
                def __init__(self, file_path, filename):
                    self.filename = filename
                    self.file_path = file_path
                
                async def read(self):
                    with open(self.file_path, "rb") as f:
                        return f.read()
            
            mock_file = MockUploadFile(result_path, f"enhanced_{file.filename}")
            upload_result = await uploadFileToFilebase(mock_file, request)

        # Create file record in database
        file_create = FileCreate(
            link=upload_result["url"],
            type="enhance"
        )
        
        db_file = FileModel(
            link=file_create.link,
            type=file_create.type,
            user_id=current_user.id
        )
        
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        return FileOut.from_orm(db_file)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )
    finally:
        # Clean up temp files
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if os.path.exists(result_path):
            os.remove(result_path)


@router.post("/remove-background", response_model=FileOut)
async def remove_background_route(
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    os.makedirs("temp_images", exist_ok=True)

    temp_path = f"temp_images/temp_{uuid.uuid4()}.jpg"
    result_path = f"temp_images/bg_removed_{uuid.uuid4()}.png"

    try:
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        success = await remove_background(temp_path, result_path)
        if not success or not os.path.exists(result_path):
            raise HTTPException(
                status_code=500,
                detail="Failed to remove background"
            )

        # Create a file object for upload to local storage
        with open(result_path, "rb") as bg_removed_file:
            class MockUploadFile:
                def __init__(self, file_path, filename):
                    self.filename = filename
                    self.file_path = file_path
                
                async def read(self):
                    with open(self.file_path, "rb") as f:
                        return f.read()
            
            mock_file = MockUploadFile(result_path, f"bg_removed_{file.filename}")
            upload_result = await uploadFileToFilebase(mock_file, request)

        # Create file record in database
        file_create = FileCreate(
            link=upload_result["url"],
            type="background_remove"
        )
        
        db_file = FileModel(
            link=file_create.link,
            type=file_create.type,
            user_id=current_user.id
        )
        
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        return FileOut.from_orm(db_file)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error removing background: {str(e)}"
        )
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if os.path.exists(result_path):
            os.remove(result_path)
