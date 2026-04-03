from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# schema for user registration
class UserCreate(BaseModel):
    name: str = Field(alias="name")
    email: str = Field(alias="email") # use str for reliability
    password: str = Field(alias="password")
    role: Optional[str] = Field("student", alias="role")
    mobileNumber: Optional[str] = Field(None, alias="mobileNumber")

    class Config:
        populate_by_name = True

# schema for user response (hide password)
class UserOut(BaseModel):
    id: int
    name: str = Field(alias="name")
    email: EmailStr = Field(alias="email")
    mobile_number: Optional[str] = Field(None, alias="mobileNumber")
    role: str = Field(alias="role")
    institution_id: Optional[str] = Field(None, alias="institutionId")
    created_at: datetime = Field(alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True

# schema for login request
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# schema for jwt token
class Token(BaseModel):
    accessToken: str
    refreshToken: str
    token_type: str = "bearer"
    user: UserOut

# data stored in token
class TokenData(BaseModel):
    email: Optional[str] = None

# schema for password verification
class VerifyPasswordRequest(BaseModel):
    password: str
