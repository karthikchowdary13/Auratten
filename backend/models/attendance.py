from sqlalchemy import Column, Integer, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# attendance record model
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="PRESENT") # "PRESENT" or "ABSENT"
    scanned_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    user = relationship("User", backref="attendance_records")
    qr_session = relationship("Session", backref="attendance_records")
