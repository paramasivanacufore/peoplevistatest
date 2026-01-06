from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, TYPE_CHECKING
from datetime import datetime
import re

if TYPE_CHECKING:
    pass

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    employee_id: int
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserLogin(BaseModel):
    login: str = Field(..., min_length=1, max_length=100)  # username or email
    password: str = Field(..., min_length=1, max_length=128)
    remember_me: bool = False
    recaptcha_token: str

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    first_name: str
    last_name: str
    employee_id: int
    status: str
    created_at: datetime

class SessionResponse(BaseModel):
    session_id: str
    expires_in: int
    message: str = "Login successful"
    user: Optional["MinimalUserResponse"] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class LoginHistoryResponse(BaseModel):
    id: int
    user_id: int
    login_time: datetime
    ip_address: str
    user_agent: Optional[str]
    status: str
    failure_reason: Optional[str]

class AuthUser(BaseModel):
    user_id: int
    username: str
    email: str
    first_name: str
    last_name: str
    employee_id: int
    role_id: Optional[int] = None
    role_name: Optional[str] = None
    position_name: Optional[str] = None
    permissions: dict = {}
    role_levels: list = []
    is_superadmin: bool = False

class MinimalUserResponse(BaseModel):
    """Minimal user response with only essential fields for localStorage"""
    user_id: int
    first_name: str
    last_name: str
    position_name: Optional[str] = None
    role_id: Optional[int] = None
    role_name: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None