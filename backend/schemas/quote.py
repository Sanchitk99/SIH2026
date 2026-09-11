from pydantic import BaseModel, Field

class QuoteCreate(BaseModel):
    lot_id: str
    quoted_price: float = Field(..., gt=0)
    price_per_unit: float = Field(..., gt=0)
    pickup_available: bool
    estimated_pickup_date: str

class QuoteResponse(QuoteCreate):
    id: str
    recycler_id: str
    status: str
    created_at: str
    updated_at: str