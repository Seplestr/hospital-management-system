from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import (
    patients_collection,
    staff_collection,
    inventory_collection
)

app = FastAPI()

# ======================================
# CORS
# ======================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================
# HOME
# ======================================

@app.get("/")
def home():

    return {
        "message": "Hospital Management Backend Running"
    }




# ======================================
# Dashboard
# ======================================

@app.get("/dashboard")
def get_dashboard():

    total_patients = patients_collection.count_documents({})

    total_staff = staff_collection.count_documents({})

    total_inventory = inventory_collection.count_documents({})

    recent_patients = list(
        patients_collection.find(
            {},
            {"_id": 0}
        ).sort("id", -1).limit(5)
    )

    return {
        "total_patients": total_patients,
        "total_staff": total_staff,
        "total_inventory": total_inventory,
        "recent_patients": recent_patients,
        "database": "Connected"
    }


# ======================================
# PATIENTS
# ======================================


@app.get("/patients")
def get_patients():

    patients = list(
        patients_collection.find({}, {"_id": 0})
    )

    return patients


@app.post("/patients")
def add_patient(patient: dict):

    patient["id"] = (
        patients_collection.count_documents({}) + 1
    )

    patients_collection.insert_one(patient)

    return {
        "message": "Patient Added"
    }


@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int):

    patients_collection.delete_one(
        {"id": patient_id}
    )

    return {
        "message": "Patient Removed"
    }

# ======================================
# STAFF
# ======================================

@app.get("/staff")
def get_staff():

    staff = list(
        staff_collection.find({}, {"_id": 0})
    )

    return staff


@app.post("/staff")
def add_staff(member: dict):

    member["id"] = (
        staff_collection.count_documents({}) + 1
    )

    staff_collection.insert_one(member)

    return {
        "message": "Staff Added"
    }


@app.delete("/staff/{staff_id}")
def delete_staff(staff_id: int):

    staff_collection.delete_one(
        {"id": staff_id}
    )

    return {
        "message": "Staff Removed"
    }

# ======================================
# INVENTORY
# ======================================

@app.get("/inventory")
def get_inventory():

    inventory = list(
        inventory_collection.find({}, {"_id": 0})
    )

    return inventory


@app.post("/inventory")
def add_inventory(item: dict):

    inventory_collection.insert_one(item)

    return {
        "message": "Item Added"
    }


@app.delete("/inventory/{item_name}")
def delete_inventory(item_name: str):

    inventory_collection.delete_one(
        {"name": item_name}
    )

    return {
        "message": "Item Removed"
    }