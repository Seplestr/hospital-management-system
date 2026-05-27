import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
import bcrypt
import jwt
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="VectorHMS Auth Service",
    docs_url="/api/v1/auth/docs",
    openapi_url="/api/v1/auth/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config variables
MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017/hospital_db")
JWT_SECRET = os.getenv("JWT_SECRET", "aura_hms_super_secret_key_change_me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

# Database Client
client = MongoClient(MONGO_URL)
db = client["hospital_db"]
users_collection = db["users"]

# Using direct bcrypt library for hashing

# Pydantic Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "admin"  # doctor, nurse, admin, etc.

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Utility helpers
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

# Root info
@app.get("/api/v1/auth")
def root_info():
    return {"service": "VectorHMS Authentication Service", "status": "active"}

# Register Endpoint
@app.post("/api/v1/auth/register", response_model=TokenResponse)
def register(user: UserRegister):
    # Check if user already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User with this email is already registered.")
    
    hashed_pwd = hash_password(user.password)
    
    user_data = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_pwd,
        "role": user.role,
        "created_at": datetime.utcnow()
    }
    
    users_collection.insert_one(user_data)
    
    # Generate Token immediately on successful register
    token_data = {"sub": user.email, "role": user.role, "name": user.name}
    token = create_access_token(token_data, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

# Login Endpoint
@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    user = users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token_data = {"sub": user["email"], "role": user.get("role", "admin"), "name": user.get("name", "User")}
    token = create_access_token(token_data, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": user.get("name"),
            "email": user["email"],
            "role": user.get("role", "admin")
        }
    }

# Verify Token Endpoint
@app.get("/api/v1/auth/verify")
def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is missing.")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid token scheme.")
        
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {
            "valid": True,
            "user": {
                "name": payload.get("name"),
                "email": payload.get("sub"),
                "role": payload.get("role", "admin")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token is invalid or has expired.")
