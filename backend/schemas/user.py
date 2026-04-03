from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from .auth import UserOut

# basic user info for listing
class UserList(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

# detailed user info with attendance placeholder
class UserDetails(UserOut):
    attendance_percentage: float = 0.0

    class Config:
        from_attributes = True
        
# help to map user detail when no attendance records exist yet
def map_user_details(user, percentage: float = 0.0):
    user_dict = UserOut.from_orm(user).dict()
    user_dict["attendance_percentage"] = percentage
    return user_dict
