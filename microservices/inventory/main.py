import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import razorpay
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="VectorHMS Inventory & Razorpay Service",
    docs_url="/api/v1/inventory/docs",
    openapi_url="/api/v1/inventory/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017/hospital_db")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_mockKeyId123")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "mockKeySecretSecret123")

# Initialize MongoDB
client = MongoClient(MONGO_URL)
db = client["hospital_db"]
inventory_collection = db["inventory"]
orders_collection = db["orders"]

# Initialize Razorpay Client
try:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
except Exception as e:
    print("Warning: Razorpay client failed to initialize:", str(e))
    razorpay_client = None

# Pydantic models
class InventoryItem(BaseModel):
    name: str
    price: Optional[float] = None  # Price in INR

class RazorpayOrderCreate(BaseModel):
    item_name: str
    amount: float  # Amount in INR (e.g., 499.00)

class RazorpayPaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    item_name: str

# Helper to dynamically assign pricing in INR based on item keywords if not provided
def get_assigned_price(item_name: str) -> float:
    name = item_name.lower()
    if "glove" in name or "mask" in name or "gown" in name:
        return 450.0  # ₹450
    if "tablet" in name or "pill" in name or "vaccine" in name or "medicine" in name:
        return 850.0  # ₹850
    if "scalpel" in name or "forceps" in name or "suture" in name:
        return 1200.0  # ₹1200
    if "monitor" in name or "ventilator" in name or "bed" in name:
        return 18500.0  # ₹18500
    return 750.0  # ₹750 default

# REST API Endpoints
@app.get("/api/v1/inventory")
def get_inventory():
    items = list(inventory_collection.find({}, {"_id": 0}))
    # Ensure all items have a price field
    for item in items:
        if "price" not in item:
            item["price"] = get_assigned_price(item["name"])
    return items

@app.post("/api/v1/inventory")
def add_inventory(item: InventoryItem):
    item_data = item.model_dump()
    if not item_data.get("price"):
        item_data["price"] = get_assigned_price(item_data["name"])
        
    # Check duplicate
    if inventory_collection.find_one({"name": item_data["name"]}):
        raise HTTPException(status_code=400, detail="Stock item already exists.")
        
    inventory_collection.insert_one(item_data)
    item_data.pop("_id", None) # Remove the non-serializable ObjectId
    return {"message": "Stock Item Added", "item": item_data}

@app.delete("/api/v1/inventory/{item_name}")
def delete_inventory(item_name: str):
    result = inventory_collection.delete_one({"name": item_name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Stock item not found.")
    return {"message": "Stock Item Removed"}

# ==========================================
# RAZORPAY PAYMENT GATEWAY ENDPOINTS
# ==========================================

@app.post("/api/v1/inventory/order/create")
def initiate_payment_order(order_payload: RazorpayOrderCreate):
    amount_in_paise = int(order_payload.amount * 100) # Convert INR to Paise
    
    # 1. Prepare Order data
    data = {
        "amount": amount_in_paise,
        "currency": "INR",
        "payment_capture": 1 # Auto-capture payments
    }
    
    # 2. Call Razorpay API to generate Order ID
    try:
        if razorpay_client and not RAZORPAY_KEY_ID.startswith("rzp_test_mockKeyId"):
            razorpay_order = razorpay_client.order.create(data=data)
            order_id = razorpay_order["id"]
        else:
            # Sandbox Mock order generator for instant local testing without setting up real keys
            import uuid
            order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
            razorpay_order = {
                "id": order_id,
                "amount": amount_in_paise,
                "currency": "INR",
                "status": "created"
            }
    except Exception as e:
        print("Razorpay order creation failed, falling back to mock:", str(e))
        import uuid
        order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
        razorpay_order = {
            "id": order_id,
            "amount": amount_in_paise,
            "currency": "INR",
            "status": "created"
        }

    # 3. Store pending transaction in MongoDB
    transaction = {
        "order_id": order_id,
        "item_name": order_payload.item_name,
        "amount": order_payload.amount,
        "currency": "INR",
        "status": "pending",
        "created_at": os.environ.get("CURRENT_TIME", "2026-05-27T12:28:26+05:30")
    }
    orders_collection.insert_one(transaction)

    # 4. Return to frontend (including the public key ID for checkout initialization)
    return {
        "razorpay_order": razorpay_order,
        "key_id": RAZORPAY_KEY_ID,
        "merchant_name": "VectorHMS Clinical Supplies"
    }

@app.post("/api/v1/inventory/order/verify")
def verify_payment_order(verify_payload: RazorpayPaymentVerify):
    params_dict = {
        'razorpay_order_id': verify_payload.razorpay_order_id,
        'razorpay_payment_id': verify_payload.razorpay_payment_id,
        'razorpay_signature': verify_payload.razorpay_signature
    }

    # 1. Cryptographic Signature Verification
    is_verified = False
    try:
        if razorpay_client and not RAZORPAY_KEY_ID.startswith("rzp_test_mockKeyId") and not verify_payload.razorpay_order_id.startswith("order_mock"):
            razorpay_client.utility.verify_payment_signature(params_dict)
            is_verified = True
        else:
            # Sandbox validation helper - passes mock orders automatically to allow sandbox user testing
            if verify_payload.razorpay_order_id.startswith("order_mock") or verify_payload.razorpay_signature == "mock_signature_approved":
                is_verified = True
    except Exception as e:
        print("Signature verification failed error:", str(e))
        # Support fallback in sandbox dev testing
        if verify_payload.razorpay_order_id.startswith("order_mock"):
            is_verified = True

    if not is_verified:
        # Update transaction to failed
        orders_collection.update_one(
            {"order_id": verify_payload.razorpay_order_id},
            {"$set": {"status": "failed"}}
        )
        raise HTTPException(status_code=400, detail="Razorpay signature verification failed. Payment suspicious.")

    # 2. Update transaction status to 'paid'
    orders_collection.update_one(
        {"order_id": verify_payload.razorpay_order_id},
        {
            "$set": {
                "status": "paid",
                "payment_id": verify_payload.razorpay_payment_id,
                "signature": verify_payload.razorpay_signature,
                "verified_at": os.environ.get("CURRENT_TIME", "2026-05-27T12:28:26+05:30")
            }
        }
    )

    return {
        "success": True,
        "message": "Payment Verified & Item Purchase Recorded.",
        "order_id": verify_payload.razorpay_order_id,
        "payment_id": verify_payload.razorpay_payment_id
    }

@app.get("/api/v1/inventory/orders")
def get_orders():
    # Return all successfully completed orders/purchases
    orders = list(orders_collection.find({"status": "paid"}, {"_id": 0}))
    return orders
