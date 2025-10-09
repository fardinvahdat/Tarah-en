from typing import Dict
import os
import uuid
from fastapi import Request
from app.config import settings


async def uploadFileToFilebase(file, request: Request = None) -> Dict[str, str]:
    """
    Stream file directly to disk without loading in memory
    """
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_extension = file.filename.split(
        '.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)

    # Stream directly to disk
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(8192):  # 8KB chunks
            buffer.write(chunk)

    # Use configured base URL instead of request object
    base_url = settings.BASE_URL if hasattr(
        settings, 'BASE_URL') else "http://localhost:8009"
    file_url = f"{base_url.rstrip('/')}/static/uploads/{unique_filename}"

    return {
        "url": file_url,
        "filename": unique_filename,
        "local_path": file_path
    }
