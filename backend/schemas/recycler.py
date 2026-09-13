from pydantic import BaseModel
from typing import Optional, List

class RecyclerProfileUpdate(BaseModel):
    facility_name: str
    facility_address: str
    city: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_person: Optional[str] = None
    authorization_number: Optional[str] = None
    pickup_available: bool = False
    service_area: int = 10 # km

# --- NEW SCHEMAS ADDED BELOW ---

class MaterialRate(BaseModel):
    category_id: str
    price_per_kg: float

class RecyclerPreferences(BaseModel):
    accepted_categories: List[str]
    rates: List[MaterialRate]
