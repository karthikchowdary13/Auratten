from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.attendance import Attendance
from models.qr_session import Session as QRSession
from schemas.attendance import AttendanceScan, AttendanceOut
from routes.auth import get_current_user
from models.user import User
from utils.redis_client import redis_client
from typing import List

router = APIRouter(prefix="/attendance", tags=["attendance"])

# student scans qr code to mark attendance
@router.post("/scan", response_model=AttendanceOut)
def mark_attendance(
    scan_data: AttendanceScan,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # check token in redis/memory
    token_key = f"qr_token:{scan_data.section_id}"
    valid_token = redis_client.get(token_key)

    if not valid_token or valid_token != scan_data.token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid or expired qr code"
        )
    
    # find the active session for this section
    session = db.query(QRSession).filter(
        QRSession.section_id == scan_data.section_id,
        QRSession.is_active == True # check if session is still live
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="no active session found for this section"
        )

    # check if student already marked attendance for this session
    already_marked = db.query(Attendance).filter(
        Attendance.user_id == current_user.id,
        Attendance.session_id == session.id
    ).first()

    if already_marked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="attendance already marked for this session"
        )

    # store the attendance record
    new_attendance = Attendance(
        user_id=current_user.id,
        session_id=session.id
    )
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)

    return new_attendance

# get analytics for the dashboard
@router.get("/analytics")
def get_analytics(
    institution_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # logic to aggregate stats
    total_users = db.query(User).filter(User.role == "student").count()
    total_scans = db.query(Attendance).count() # total ever for simplicity
    
    # hourly stats placeholder
    hourly = [
        {"hour": "8AM", "count": 2},
        {"hour": "10AM", "count": 15},
        {"hour": "12PM", "count": 8},
        {"hour": "2PM", "count": 4},
        {"hour": "4PM", "count": 0},
    ]
    
    return {
        "stats": {
            "totalUsers": total_users,
            "avgAttendance": "85%",
            "totalSessions": db.query(QRSession).count(),
            "todayScans": total_scans,
            "lastWeekTrend": 5,
            "hourlyStats": hourly
        }
    }

# get attendance for a specific session
@router.get("/session/{session_id}")
def get_session_attendance(
    session_id: int,
    db: Session = Depends(get_db)
):
    records = db.query(Attendance).filter(Attendance.session_id == session_id).all()
    # map to include user info for the frontend
    results = []
    for r in records:
        user = db.query(User).filter(User.id == r.user_id).first()
        results.append({
            "id": r.id,
            "userId": r.user_id,
            "markedAt": r.scanned_at,
            "user": {
                "id": user.id if user else None,
                "name": user.name if user else "Unknown",
                "email": user.email if user else ""
            }
        })
    return results

# get all attendance records
@router.get("/", response_model=List[AttendanceOut])
def list_attendance(
    session_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Attendance)
    if session_id:
        query = query.filter(Attendance.session_id == session_id)
    return query.all()

# get attendance for a specific student
@router.get("/student/{student_id}", response_model=List[AttendanceOut])
def get_student_attendance(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Attendance).filter(Attendance.user_id == student_id).all()
