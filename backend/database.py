import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

print("MONGO URL =", MONGO_URL)

client = MongoClient(MONGO_URL)

db = client["hospital_db"]

patients_collection = db["patients"]

staff_collection = db["staff"]

inventory_collection = db["inventory"]

print("MongoDB Connected Successfully")