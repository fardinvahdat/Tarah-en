from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64
import io
import uuid
import os
from PIL import Image, ImageOps
from typing import Optional
from app.config import settings  # Import your settings module

router = APIRouter()


class ImageCompressionRequest(BaseModel):
    base64_image: str
    quality: Optional[int] = 85
    max_width: Optional[int] = None
    max_height: Optional[int] = None


@router.post("/compress-image")
async def compress_image(request: ImageCompressionRequest):
    """
    Compress a base64 image and save it to static folder
    Returns URL to the compressed image
    """
    try:
        # Extract base64 data
        if request.base64_image.startswith('data:image'):
            header, base64_data = request.base64_image.split(',', 1)
        else:
            base64_data = request.base64_image
            header = ""

        image_data = base64.b64decode(base64_data)

        # Open image with PIL
        with Image.open(io.BytesIO(image_data)) as img:
            # Store original dimensions
            original_width, original_height = img.size

            # Apply EXIF orientation
            img = ImageOps.exif_transpose(img)

            # Resize if max dimensions are specified
            if request.max_width or request.max_height:
                img.thumbnail((
                    request.max_width or original_width,
                    request.max_height or original_height
                ), Image.Resampling.LANCZOS)

            # Determine output format based on transparency
            output_format = "JPEG"
            if img.mode in ('RGBA', 'LA', 'P'):
                output_format = "PNG"

            # Convert to RGB if saving as JPEG
            if output_format == "JPEG" and img.mode != "RGB":
                img = img.convert("RGB")

            # Generate unique filename with proper extension
            ext = "jpg" if output_format == "JPEG" else "png"
            filename = f"{uuid.uuid4().hex}.{ext}"

            # Use the same static directory as your upload endpoint
            static_dir = "static/uploads"  # Changed to match your working endpoint
            os.makedirs(static_dir, exist_ok=True)

            file_path = os.path.join(static_dir, filename)

            # Save compressed image with format-specific settings
            save_kwargs = {"optimize": True}
            if output_format == "JPEG":
                save_kwargs.update({
                    "quality": request.quality,
                    "progressive": True
                })
            else:  # PNG
                save_kwargs["compress_level"] = 9

            img.save(file_path, output_format, **save_kwargs)

            # Get file size
            file_size = os.path.getsize(file_path)

            # Use the same URL format as your upload endpoint
            base_url = settings.BASE_URL.rstrip('/')
            file_url = f"{base_url}/static/uploads/{filename}"

            return {
                "success": True,
                "url": file_url,
                "filename": filename,
                "original_dimensions": {
                    "width": original_width,
                    "height": original_height
                },
                "compressed_dimensions": {
                    "width": img.width,
                    "height": img.height
                },
                "file_size": file_size,
                "format": output_format.lower(),
                "compression_ratio": round((1 - file_size / len(image_data)) * 100, 2)
            }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Image compression failed: {str(e)}"
        )
