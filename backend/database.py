from pymongo import MongoClient

MONGO_URL = "mongodb+srv://pandeypr3_db_prab:nJtErB0H5S5Zu2XI@cluster0.4015w2f.mongodb.net/?appName=cluster0"

client = MongoClient(MONGO_URL)

db = client["hospital_db"]

patients_collection = db["patients"]

staff_collection = db["staff"]

inventory_collection = db["inventory"]

print("MongoDB Connected Successfully")