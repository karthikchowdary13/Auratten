from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

class InstitutionBase(BaseModel):
    name: str
    type: str
    address: Optional[str] = None
    departments: List[str] = []
    admin_id: Optional[int] = None

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionResponse(InstitutionBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class SystemSettingsUpdate(BaseModel):
    admin_notification_email: Optional[EmailStr] = None
    qr_expiry_seconds: Optional[int] = None
    session_timeout_minutes: Optional[int] = None
    approval_email_template: Optional[str] = None
    rejection_email_template: Optional[str] = None

class SystemSettingsResponse(BaseModel):
    admin_notification_email: str
    qr_expiry_seconds: int
    session_timeout_minutes: int
    approval_email_template: str
    rejection_email_template: str
    
    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    admin_id: Optional[int]
    action: str
    target_type: Optional[str]
    target_id: Optional[str]
    details: Optional[Any]
    ip_address: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

class UserAdminUpdate(BaseModel):
    role: Optional[str] = None
    status: Optional[str] = None
    institution_id: Optional[str] = None

class AdminStats(BaseModel):
    total_users: int
    active_users: int
    pending_users: int
    total_institutions: int
    live_sessions: int
    pending_approvals: int

class AttendanceOverride(BaseModel):
    user_id: int
    session_id: int
    status: str # PRESENT, ABSENT
    
class ManualQRGenerate(BaseModel):
    section_id: int
    institution_id: str
