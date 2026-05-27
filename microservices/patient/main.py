import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="VectorHMS Patient Service",
    docs_url="/api/v1/patients/docs",
    openapi_url="/api/v1/patients/openapi.json"
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
patients_collection = db["patients"]

class Patient(BaseModel):
    name: str
    disease: str

@app.get("/api/v1/patients")
def get_patients():
    patients = list(patients_collection.find({}, {"_id": 0}))
    return patients

class AssignmentPayload(BaseModel):
    staff_id: int
    staff_name: str

@app.post("/api/v1/patients")
def add_patient(patient: Patient):
    patient_data = patient.model_dump()
    
    # Auto-incrementing basic ID (for legacy compatibility)
    max_patient = list(patients_collection.find().sort("id", -1).limit(1))
    if max_patient:
        patient_data["id"] = max_patient[0]["id"] + 1
    else:
        patient_data["id"] = 1
        
    # Initialize assignment fields to None
    patient_data["assigned_staff_id"] = None
    patient_data["assigned_staff_name"] = None
        
    patients_collection.insert_one(patient_data)
    return {"message": "Patient Registered", "id": patient_data["id"]}

@app.put("/api/v1/patients/{patient_id}/assign")
def assign_patient(patient_id: int, payload: AssignmentPayload):
    patient = patients_collection.find_one({"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    
    patients_collection.update_one(
        {"id": patient_id},
        {"$set": {"assigned_staff_id": payload.staff_id, "assigned_staff_name": payload.staff_name}}
    )
    return {"message": f"Patient successfully assigned to {payload.staff_name}"}

@app.put("/api/v1/patients/{patient_id}/unassign")
def unassign_patient(patient_id: int):
    patient = patients_collection.find_one({"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    
    patients_collection.update_one(
        {"id": patient_id},
        {"$set": {"assigned_staff_id": None, "assigned_staff_name": None}}
    )
    return {"message": "Patient successfully unassigned"}

@app.delete("/api/v1/patients/{patient_id}")
def delete_patient(patient_id: int):
    result = patients_collection.delete_one({"id": patient_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient record not found.")
    return {"message": "Patient Discharged"}
