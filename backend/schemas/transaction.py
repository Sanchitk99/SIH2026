from pydantic import BaseModel
from typing import Optional

class HandoverRecord(BaseModel):
    final_weight: float
    final_price: float
    handover_latitude: float
    handover_longitude: float

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