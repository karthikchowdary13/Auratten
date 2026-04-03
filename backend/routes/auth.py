from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import timedelta

from database import get_db
from models.user import User
from schemas.auth import UserCreate, UserOut, LoginRequest, Token, TokenData, VerifyPasswordRequest
from utils.auth import get_password_hash, verify_password, create_access_token, ALGORITHM
from config import settings

# define oauth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter(prefix="/auth", tags=["authentication"])

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # dependency to get the currently logged in user
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # decode jwt token
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # check if email exists
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        mobile_number=user_data.mobileNumber,
        password=hashed_password,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    # verify credentials and return jwt token
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # check if user exists and password is correct
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # generate the tokens
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(minutes=30)
    )
    refresh_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(days=7)
    )
    
    # ensure role is uppercase for frontend compatibility
    user_data = UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        mobileNumber=user.mobile_number,
        role=user.role.upper(),
        institutionId=user.institution_id,
        createdAt=user.created_at
    )
    
    return {
        "accessToken": access_token, 
        "refreshToken": refresh_token,
        "token_type": "bearer",
        "user": user_data
    }

@router.post("/verify-password")
def verify_user_password(
    data: VerifyPasswordRequest, 
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )
    return {"valid": True}
