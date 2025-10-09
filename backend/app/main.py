
import time
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from app.api.v1.api_v1 import api_router
from app.config import settings
from app.database import engine, Base

app = FastAPI(title=settings.PROJECT_NAME)

# Create static directory if it doesn't exist
os.makedirs("static/uploads", exist_ok=True)

# Mount static files to serve uploaded images
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routers
app.include_router(api_router, prefix="/api/v1")

# Create database tables (for development)
@app.on_event("startup")
async def startup():
    retries = 5
    while retries > 0:
        try:
            Base.metadata.create_all(bind=engine)
            break
        except Exception as e:
            retries -= 1
            if retries == 0:
                raise e
            time.sleep(5)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8009,
        # Increase timeouts and body size
        timeout_keep_alive=300,
        limit_max_requests=1000,
        limit_concurrency=100,
        client_max_body_size=100 * 1024 * 1024  # 100MB
    )
