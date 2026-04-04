from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.user import User
from schemas.user import UserList, UserDetails, map_user_details
from routes.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

from typing import Optional
from models.section import SectionStudent

@router.get("/")
@router.get("", response_model=List[UserList])
def list_users(
    institution_id: Optional[str] = None,
    section_id: Optional[int] = Query(None, alias="sectionId"),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # only admin/teacher can see all users
    if current_user.role.lower() not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(User)
    
    if institution_id:
        query = query.filter(User.institution_id == institution_id)
    
    if section_id:
        query = query.join(SectionStudent).filter(SectionStudent.section_id == section_id)
        
    return query.all()

@router.get("/{user_id}", response_model=UserDetails)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # calculate simple attendance percentage (placeholder for now)
    # in the future this will query an attendance table
    percentage = 0.0
    if user.role == "student":
        # logic to calculate percentage goes here
        percentage = 95.0 # hardcoded placeholder
        
    return map_user_details(user, percentage)

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # only admins can delete users
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete users")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
