from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

# user model for students, teachers, and admins
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    mobile_number = Column(String, nullable=True)
    password = Column(String)
    role = Column(String, default="STUDENT") # STUDENT, TEACHER, INSTITUTION_ADMIN, SUPER_ADMIN
    institution_id = Column(String, nullable=True)
    status = Column(String, default="PENDING") # PENDING, ACTIVE, REJECTED, SUSPENDED
    
    last_active = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
