from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# mapping table for students in sections
class SectionStudent(Base):
    __tablename__ = "section_students"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

# section model (e.g. Class 10A, CSE-1)
class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    institution_id = Column(String, default="auratten_main")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    students = relationship("User", secondary="section_students", backref="sections")
