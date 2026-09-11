from fastapi import APIRouter, Depends
from core.security import require_roles, get_current_user
from schemas.transaction import HandoverRecord
from schemas.common import APIResponse
from services.transaction_service import TransactionService

router = APIRouter()
transaction_service = TransactionService()

@router.get("/", response_model=APIResponse)
async def get_my_transactions(
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role")
    # Both Collectors and Recyclers can view their own transactions
    if role not in ["COLLECTOR", "RECYCLER"]:
        return APIResponse(success=False, message="Invalid role", data=[])
        
    transactions = transaction_service.get_user_transactions(current_user["uid"], role)
    return APIResponse(success=True, message="Transactions fetched", data=transactions)

@router.post("/{transaction_id}/handover", response_model=APIResponse)
async def record_handover(
    transaction_id: str,
    handover_in: HandoverRecord,
    current_user: dict = Depends(require_roles(["RECYCLER"]))
):
    # Only the Recycler records the final handover weights and prices
    result = transaction_service.record_handover(transaction_id, current_user["uid"], handover_in)
    return APIResponse(success=True, message="Handover recorded", data=result)