from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# schema to generate a qr
class QRGenerate(BaseModel):
    section_id: int = Field(alias="sectionId")
    expires_in_minutes: Optional[int] = Field(5, alias="expiresInMinutes")

    class Config:
        populate_by_name = True

class SectionInfo(BaseModel):
    id: int
    name: str = Field(alias="name")
    student_count: Optional[int] = Field(None, alias="studentCount")

    class Config:
        from_attributes = True
        populate_by_name = True

class UserInfo(BaseModel):
    id: int
    name: str = Field(alias="name")
    email: str = Field(alias="email")

    class Config:
        from_attributes = True
        populate_by_name = True

# response schema for a session
class QRSessionOut(BaseModel):
    id: int
    section_id: int = Field(alias="sectionId")
    token: str
    is_active: bool = Field(alias="isActive")
    start_time: datetime = Field(alias="startTime")
    end_time: Optional[datetime] = Field(None, alias="endTime")
    section: Optional[SectionInfo] = None
    created_by: Optional[UserInfo] = Field(None, alias="createdBy")
    attendance_count: int = Field(0, alias="attendanceCount")

    class Config:
        from_attributes = True
        populate_by_name = True

# active token info
class QRActive(BaseModel):
    token: str
    expires_in: int # seconds remaining
