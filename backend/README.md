├── alembic.ini
├── alembic/
│   ├── alembic/env.py
│   ├── alembic/script.py.mako
│   └── alembic/versions/
│       └── <migration_files>.py
├── app/
│   ├── app/main.py
│   ├── app/config.py
│   ├── app/database.py
│   ├── app/models/
│   │   ├── app/models/__init__.py
│   │   ├── app/models/user.py
│   │   ├── app/models/template.py
│   │   ├── app/models/workspace.py
│   │   └── app/models/RRDB_ESRGAN_x4.pth
│   ├── app/schemas/
│   │   ├── app/schemas/__init__.py
│   │   ├── app/schemas/user.py
│   │   └── app/schemas/template.py
│   │   └── app/schemas/workspace.py
│   ├── app/services/
│   │   ├── app/services/__init__.py
│   │   ├── app/services/auth.py
│   │   └── app/services/template.py
│   │   └── app/services/workspace.py
│   ├── app/utils/
│   │   ├── app/utils/__init__.py
│   │   ├── app/utils/security.py
│   │   └── app/utils/image_processing.py
│   ├── app/api/
│   │   ├── app/api/__init__.py
│   │   ├── app/api/v1/
│   │   │   ├── app/api/v1/__init__.py
│   │   │   ├── app/api/v1/api_v1.py
│   │   │   └── app/api/v1/endpoints/
│   │   │       ├── app/api/v1/endpoints/__init__.py
│   │   │       ├── app/api/v1/endpoints/auth.py
│   │   │       ├── app/api/v1/endpoints/images.py
│   │   │       ├── app/api/v1/endpoints/init.py
│   │   │       ├── app/api/v1/endpoints/users.py
│   │   │       └── app/api/v1/endpoints/templates.py
│   └── app/requirements.txt
├── .env
