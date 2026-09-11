from pydantic import BaseModel
from typing import Optional

class RecyclerProfileUpdate(BaseModel):
    facility_name: str
    facility_address: str
    city: str
    state: str
    latitude: float
    longitude: float
    authorization_number: Optional[str] = None
    pickup_available: bool = False
    service_area: int = 10 # km