from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from config import settings

# use pbkdf2_sha256 as default and bcrypt for backwards compatibility
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

# algorithms for jwt
ALGORITHM = "HS256"

def verify_password(plain_password, hashed_password):
    # check if plain password matches hash
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # generate bcrypt hash
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    # create a new jwt access token
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # fallback to 15 mins if not specified
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt
