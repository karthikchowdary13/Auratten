from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    admin_notification_email = Column(String, default="admin@auratten.com")
    qr_expiry_seconds = Column(Integer, default=30)
    session_timeout_minutes = Column(Integer, default=60)
    
    # Email templates
    approval_email_template = Column(String, default="Welcome to Auratten! Your account has been approved.")
    rejection_email_template = Column(String, default="Sorry, your Auratten account request was not approved at this time.")
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
