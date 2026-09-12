from pydantic import BaseModel, Field
from typing import Optional

class HandoverRecord(BaseModel):
    final_weight: float = Field(..., gt=0)
    final_price: float = Field(..., gt=0)
    handover_latitude: float = Field(..., ge=-90, le=90)
    handover_longitude: float = Field(..., ge=-180, le=180)

class TransactionResponse(BaseModel):
    id: str
    lot_id: str
    collector_id: str
    recycler_id: str
    quote_id: str
    transaction_status: str
    payment_status: str
    final_weight: Optional[float] = None
    final_price: Optional[float] = None
    created_at: str
    updated_at: str
