from pydantic import BaseModel, Field
from typing import Optional
from models.enums import LotStatus

class LotCreate(BaseModel):
    material_category_id: str
    material_category_name: str
    material_description: str
    approximate_weight: float = Field(..., gt=0)
    weight_unit: str = "kg"
    collection_location: str
    latitude: float
    longitude: float

class LotResponse(LotCreate):
    lot_reference: str
    collector_id: str
    status: LotStatus
    created_at: str
    updated_at: str