from pydantic import BaseModel, Field, validator
import re

class UserLogin(BaseModel):
    user_id: str
    password: str

class UserRegister(BaseModel):
    user_id: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=8)

    @validator('user_id')
    def validate_user_id(cls, v):
        if not re.match(r'^[a-zA-Z0-9._]+$', v):
                raise ValueError('User ID can only contain letters, numbers, periods, and underscores')
        return v.lower()

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Your new password must be at least 8 characters long.')
        return v

class ChangePasswordResponse(BaseModel):
    message: str

class UserResponse(BaseModel):
    id: int
    user_id: str

    class Config:
        from_attributes = True

class LogoutResponse(BaseModel):
    message: str
