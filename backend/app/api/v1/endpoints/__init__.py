
from .auth import router as auth_router
from .users import router as users_router
from .images import router as images_router
from .templates import router as templates_router
from .files import router as files_router
from .compress import router as compress_router

__all__ = ["auth_router", "compress_router", "users_router", "images_router", "templates_router", "files_router"]
