from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
from models.section import Section, SectionStudent
from models.user import User
from schemas.section import SectionCreate, SectionOut, AddStudent
from routes.auth import get_current_user

router = APIRouter(prefix="/sections", tags=["sections"])

@router.post("/", response_model=SectionOut)
@router.post("", response_model=SectionOut)
def create_section(section: SectionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # only admin/teacher can create sections
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # check if section name already exists
    db_section = db.query(Section).filter(Section.name == section.name).first()
    if db_section:
        raise HTTPException(status_code=400, detail="Section already exists")
    
    new_section = Section(name=section.name)
    db.add(new_section)
    db.commit()
    db.refresh(new_section)
    return new_section

@router.get("/", response_model=List[SectionOut])
@router.get("", response_model=List[SectionOut])
def list_sections(db: Session = Depends(get_db)):
    # get all sections with student count
    sections = db.query(Section).all()
    
    results = []
    for s in sections:
        count = db.query(SectionStudent).filter(SectionStudent.section_id == s.id).count()
        results.append({
            "id": s.id,
            "name": s.name,
            "studentCount": count,
            "avgAttendanceLast3": 0.0,
            "lastSessionAt": None,
            "createdAt": s.created_at
        })
    return results

@router.get("/institution/{inst_id}", response_model=List[SectionOut])
def get_sections_by_institution(inst_id: str, db: Session = Depends(get_db)):
    # filter sections by institution
    sections = db.query(Section).filter(Section.institution_id == inst_id).all()
    results = []
    for s in sections:
        count = db.query(SectionStudent).filter(SectionStudent.section_id == s.id).count()
        results.append({
            "id": s.id,
            "name": s.name,
            "studentCount": count,
            "avgAttendanceLast3": 0.0,
            "lastSessionAt": None,
            "createdAt": s.created_at
        })
    return results

@router.post("/{section_id}/students")
def add_student_to_section(section_id: int, student_data: AddStudent, db: Session = Depends(get_db)):
    # check if student exists
    user = db.query(User).filter(User.id == student_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # check if already in section
    existing = db.query(SectionStudent).filter(
        SectionStudent.section_id == section_id,
        SectionStudent.user_id == student_data.user_id
    ).first()
    
    if existing:
        return {"message": "User already in section"}
    
    mapping = SectionStudent(section_id=section_id, user_id=student_data.user_id)
    db.add(mapping)
    db.commit()
    return {"message": "Student added successfully"}

@router.get("/{section_id}/students")
def list_section_students(section_id: int, db: Session = Depends(get_db)):
    # get all users mapped to this section
    students = db.query(User).join(SectionStudent).filter(SectionStudent.section_id == section_id).all()
    return students
