from app.schemas.user import MobileLoginRequest, OTPRequest, Token
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random
import time

from app.services.auth import create_or_login_user_by_mobile
from app.database import get_db

otp_store = {}

router = APIRouter()


@router.post("/request-otp")
async def request_otp(payload: OTPRequest):
    # Generate a 6-digit OTP
    otp_code = "123456"
    # otp_code = str(random.randint(100000, 999999))

    # Store with expiration (just an example, should use Redis or DB in real app)
    otp_store[payload.mobile] = {
        "code": otp_code,
        "expires_at": time.time() + 300  # 5 minutes expiry
    }

    # TODO: Integrate actual SMS sending here
    print(f"OTP for {payload.mobile}: {otp_code}")  # Simulate SMS

    return {"message": f"OTP sent to {payload.mobile}"}


@router.post("/login", response_model=Token)
async def login_with_mobile(
    payload: MobileLoginRequest,
    db: Session = Depends(get_db)
):
    otp_data = otp_store.get(payload.mobile)
    if not otp_data or otp_data["code"] != payload.code:
        raise HTTPException(
            status_code=400, detail="Invalid or expired verification code")

    if otp_data["expires_at"] < time.time():
        raise HTTPException(status_code=400, detail="OTP has expired")

    # Optionally: remove OTP after successful use
    del otp_store[payload.mobile]

    return await create_or_login_user_by_mobile(payload.mobile, db)
