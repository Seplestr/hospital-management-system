import os

from pymongo import MongoClient

MONGO_URL = os.getenv("MONGO_URL")

client = MongoClient(MONGO_URL)

db = client["hospital_db"]

patients_collection = db["patients"]

staff_collection = db["staff"]

inventory_collection = db["inventory"]

print("MongoDB Connected Successfully")