from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import time
from typing import List

from database import get_db
from models.qr_session import Session as QRSession
from models.user import User
from models.section import SectionStudent
from routes.auth import get_current_user
from utils.redis_client import redis_client
from schemas.qr import QRGenerate, QRSessionOut

router = APIRouter(prefix="/qr", tags=["qr"])

@router.post("/", response_model=dict)
@router.post("", response_model=dict)
def create_session(data: QRGenerate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        print(f"Creating session for section {data.section_id} (requested by {current_user.email})")
        # only teachers/admins can start a session
        if current_user.role not in ["teacher", "admin"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # check if there's already an active session for this section
        active_session = db.query(QRSession).filter(
            QRSession.section_id == data.section_id,
            QRSession.is_active == True
        ).first()
        
        if active_session:
            active_session.is_active = False
            active_session.end_time = datetime.utcnow()
        
        token = str(uuid.uuid4())[:8].upper()
        print(f"Generated token: {token}")
        
        redis_key = f"qr_token:{data.section_id}"
        # using our fallback-enabled redis_client
        redis_client.set(redis_key, token, ex=5)
        
        new_session = QRSession(
            section_id=data.section_id,
            created_by_id=current_user.id,
            token=token,
            is_active=True
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        print(f"Session {new_session.id} created successfully")
        
        from fastapi.encoders import jsonable_encoder
        from schemas.qr import QRSessionOut
        
        return {
            "session": jsonable_encoder(QRSessionOut.model_validate(new_session)), 
            "token": token
        }
    except Exception as e:
        import traceback
        print(f"ERROR in create_session: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

from models.section import Section
from models.attendance import Attendance
from sqlalchemy import func

@router.get("/institution/{inst_id}", response_model=List[QRSessionOut])
def get_active_sessions(inst_id: str, db: Session = Depends(get_db)):
    # return active sessions for an institution
    sessions = db.query(QRSession).join(Section).filter(
        Section.institution_id == inst_id,
        QRSession.is_active == True
    ).all()
    
    # add attendance count for each
    for s in sessions:
        s.attendance_count = db.query(Attendance).filter(Attendance.session_id == s.id).count()
        if s.section:
            s.section.student_count = db.query(User).join(SectionStudent).filter(SectionStudent.section_id == s.section.id).count()
        
    return sessions

@router.get("/history/{inst_id}", response_model=List[QRSessionOut])
@router.get("/history/{inst_id}/", response_model=List[QRSessionOut])
def get_session_history(inst_id: str, db: Session = Depends(get_db)):
    # return historical sessions for an institution
    sessions = db.query(QRSession).join(Section).filter(
        Section.institution_id == inst_id
    ).order_by(QRSession.start_time.desc()).all()
    
    for s in sessions:
        s.attendance_count = db.query(Attendance).filter(Attendance.session_id == s.id).count()
        if s.section:
            s.section.student_count = db.query(User).join(SectionStudent).filter(SectionStudent.section_id == s.section.id).count()
        
    return sessions

@router.patch("/{session_id}/rotate", response_model=dict)
def rotate_token(session_id: int, db: Session = Depends(get_db)):
    session = db.query(QRSession).filter(QRSession.id == session_id, QRSession.is_active == True).first()
    if not session:
        raise HTTPException(status_code=404, detail="Active session not found")
        
    new_token = str(uuid.uuid4())[:8].upper()
    session.token = new_token
    
    redis_key = f"qr_token:{session.section_id}"
    redis_client.set(redis_key, new_token, ex=5)
    
    db.commit()
    return {"token": new_token}

@router.patch("/{session_id}/end")
@router.patch("/{session_id}/end/")
def end_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(QRSession).filter(QRSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.is_active = False
    session.end_time = datetime.utcnow()
    
    # -- Automatic Absent Marking --
    # 1. Get all students assigned to this section
    roster = db.query(User).join(SectionStudent).filter(SectionStudent.section_id == session.section_id).all()
    
    # 2. Get students who already have a record for this session (PRESENT)
    present_user_ids = {r.user_id for r in db.query(Attendance).filter(Attendance.session_id == session_id).all()}
    
    # 3. Create ABSENT records for missing students
    for student in roster:
        if student.id not in present_user_ids:
            absent_record = Attendance(
                user_id=student.id,
                session_id=session_id,
                status="ABSENT"
            )
            db.add(absent_record)
    
    redis_key = f"qr_token:{session.section_id}"
    redis_client.delete(redis_key)
    
    db.commit()
    return {"message": "Session ended and absent students marked"}
