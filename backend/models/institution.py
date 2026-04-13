from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    type = Column(String) # School, College, Enterprise
    address = Column(String, nullable=True)
    
    # Departments stored as a list of strings in JSON
    departments = Column(JSON, default=[]) 
    
    admin_id = Column(Integer, nullable=True) # ID of the User who is the primary admin
    
    status = Column(String, default="ACTIVE") # ACTIVE, SUSPENDED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
