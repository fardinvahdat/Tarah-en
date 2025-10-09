from datetime import timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserInDB
from app.schemas.user import Token
from app.utils.security import create_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")



async def create_or_login_user_by_mobile(mobile: str, db: Session) -> Token:
    user = db.query(User).filter(User.mobile == mobile).first()

    if not user:
        user = User(
            mobile=mobile,
            full_name="",
            hashed_password="",  # Optional since we're not using passwords
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.mobile}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")




def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY,
                             algorithms=[settings.ALGORITHM])
        mobile: str = payload.get("sub")
        if mobile is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.mobile == mobile).first()
    if user is None:
        raise credentials_exception
    return user
