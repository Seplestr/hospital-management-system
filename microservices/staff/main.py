import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="VectorHMS Staff Service",
    docs_url="/api/v1/staff/docs",
    openapi_url="/api/v1/staff/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017/hospital_db")

# Database client
client = MongoClient(MONGO_URL)
db = client["hospital_db"]
staff_collection = db["staff"]

class Staff(BaseModel):
    name: str
    role: str

@app.get("/api/v1/staff")
def get_staff():
    staff = list(staff_collection.find({}, {"_id": 0}))
    return staff

@app.post("/api/v1/staff")
def add_staff(member: Staff):
    staff_data = member.model_dump()
    
    # Auto-incrementing basic ID
    max_staff = list(staff_collection.find().sort("id", -1).limit(1))
    if max_staff:
        staff_data["id"] = max_staff[0]["id"] + 1
    else:
        staff_data["id"] = 1
        
    staff_collection.insert_one(staff_data)
    return {"message": "Staff Member Enrolled", "id": staff_data["id"]}

@app.delete("/api/v1/staff/{staff_id}")
def delete_staff(staff_id: int):
    result = staff_collection.delete_one({"id": staff_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Staff record not found.")
    return {"message": "Staff Member De-registered"}
