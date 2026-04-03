from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.attendance import Attendance
from models.user import User
from models.section import Section
from models.qr_session import Session as QRSession
from routes.auth import get_current_user
from sqlalchemy import func, desc, asc
from typing import List

router = APIRouter(prefix="/reports", tags=["reports"])

# cumulative attendance report by section and date
@router.get("/attendance")
def get_attendance_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # group by date and section_id
    report_data = db.query(
        func.date(Attendance.scanned_at).label("date"),
        Section.name.label("section_name"),
        func.count(Attendance.id).label("present_count")
    ).join(QRSession, Attendance.session_id == QRSession.id)\
     .join(Section, QRSession.section_id == Section.id)\
     .group_by("date", "section_name")\
     .order_by(desc("date")).all()

    return [
        {
            "date": str(row.date),
            "section": row.section_name,
            "present": row.present_count
        } for row in report_data
    ]

# top students with highest attendance
@router.get("/top-students")
def get_top_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    top_data = db.query(
        User.name,
        func.count(Attendance.id).label("scans")
    ).filter(User.role == "student")\
     .join(Attendance, User.id == Attendance.user_id)\
     .group_by(User.id)\
     .order_by(desc("scans"))\
     .limit(5).all()

    return [{"name": row.name, "scans": row.scans} for row in top_data]

# students with lowest attendance
@router.get("/low-students")
def get_low_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    low_data = db.query(
        User.name,
        func.count(Attendance.id).label("scans")
    ).filter(User.role == "student")\
     .join(Attendance, User.id == Attendance.user_id)\
     .group_by(User.id)\
     .order_by(asc("scans"))\
     .limit(5).all()

    return [{"name": row.name, "scans": row.scans} for row in low_data]
