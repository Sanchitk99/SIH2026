from pydantic import BaseModel, Field
from typing import Optional
from models.enums import LotStatus

class LotCreate(BaseModel):
    material_category_id: str
    material_category_name: str
    material_description: str
    approximate_weight: float = Field(..., gt=0)
    condition: str = ""
    weight_unit: str = "kg"
    collection_location: Optional[str] = None
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)

class LotResponse(LotCreate):
    lot_reference: str
    collector_id: str
    status: LotStatus
    created_at: str
    updated_at: str
