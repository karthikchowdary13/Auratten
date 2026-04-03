from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# schema for creating a new section
class SectionCreate(BaseModel):
    name: str

# schema for section response
# shows name and how many students are in it
class SectionOut(BaseModel):
    id: int
    name: str
    studentCount: Optional[int] = 0
    avgAttendanceLast3: Optional[float] = 0.0
    lastSessionAt: Optional[datetime] = None
    createdAt: datetime

    class Config:
        from_attributes = True

# schema to add a student to a section
class AddStudent(BaseModel):
    user_id: int
