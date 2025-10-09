from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import time

def get_engine():
    retries = 5
    while retries > 0:
        try:
            engine = create_engine(settings.DATABASE_URL)
            engine.connect()
            return engine
        except Exception as e:
            retries -= 1
            if retries == 0:
                raise e
            time.sleep(5)


engine = get_engine()
# engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
