from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.attendance import Attendance
from models.user import User
from models.section import Section
from routes.auth import get_current_user
from datetime import datetime, date
from sqlalchemy import func

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# get basic stats for the dashboard
@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    
    # count total scans today
    total_scans = db.query(Attendance).filter(
        func.date(Attendance.scanned_at) == today
    ).count()

    # calculate attendance percentage
    # simple logic: (students who scanned today / total students in active sessions today)
    # for now, let's just get the ratio of scans to total users (students)
    total_students = db.query(User).filter(User.role == "student").count()
    
    attendance_pct = (total_scans / total_students * 100) if total_students > 0 else 0

    return {
        "today_attendance_percentage": round(attendance_pct, 2),
        "total_scans_today": total_scans
    }

# get live feed of recent scans
@router.get("/live")
def get_live_scans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # join with users and sections to show who scanned where
    # wait, attendance doesn't have section_id directly, it has session_id
    # session_id -> QRSession -> section_id -> Section
    from models.qr_session import Session as QRSession

    recent_scans = db.query(
        Attendance.id,
        User.name.label("student_name"),
        Section.name.label("section_name"),
        Attendance.scanned_at
    ).join(User, Attendance.user_id == User.id)\
     .join(QRSession, Attendance.session_id == QRSession.id)\
     .join(Section, QRSession.section_id == Section.id)\
     .order_by(Attendance.scanned_at.desc())\
     .limit(10).all()

    return [
        {
            "id": scan.id,
            "student_name": scan.student_name,
            "section_name": scan.section_name,
            "scanned_at": scan.scanned_at
        } for scan in recent_scans
    ]
