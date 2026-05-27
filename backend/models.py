from pydantic import BaseModel

class Patient(BaseModel):

    name: str
    disease: str

class Staff(BaseModel):

    name: str
    role: str

class Inventory(BaseModel):

    name: str