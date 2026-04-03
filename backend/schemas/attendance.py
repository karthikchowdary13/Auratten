from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# schema for scanning qr
class AttendanceScan(BaseModel):
    token: str
    student_id: int # or we can get it from current_user
    section_id: int

# schema for attendance response
class AttendanceOut(BaseModel):
    id: int
    user_id: int
    session_id: int
    status: str = "PRESENT"
    scanned_at: datetime

    class Config:
        from_attributes = True

# basic student attendance info
class StudentAttendance(BaseModel):
    session_id: int
    scanned_at: datetime
    is_present: bool = True
