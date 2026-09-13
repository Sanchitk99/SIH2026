from datetime import date

from pydantic import BaseModel, Field, field_validator

class QuoteCreate(BaseModel):
    lot_id: str
    quoted_price: float = Field(..., gt=0)
    price_per_unit: float = Field(..., gt=0)
    pickup_available: bool
    estimated_pickup_date: str

    @field_validator("estimated_pickup_date")
    @classmethod
    def validate_pickup_date(cls, value: str) -> str:
        try:
            pickup_date = date.fromisoformat(value)
        except ValueError as error:
            raise ValueError("Estimated pickup date must be a valid ISO date") from error
        if pickup_date < date.today():
            raise ValueError("Estimated pickup date cannot be in the past")
        return value

class QuoteResponse(QuoteCreate):
    id: str
    recycler_id: str
    status: str
    created_at: str
    updated_at: str
