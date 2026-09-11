from fastapi import APIRouter, Depends
from core.security import require_roles
from schemas.quote import QuoteCreate
from schemas.common import APIResponse
from services.quote_service import QuoteService

router = APIRouter()
quote_service = QuoteService()

@router.post("/", response_model=APIResponse)
async def submit_quote(
    quote_in: QuoteCreate,
    current_user: dict = Depends(require_roles(["RECYCLER"]))
):
    result = quote_service.submit_quote(current_user["uid"], quote_in)
    return APIResponse(success=True, message="Quote submitted", data=result)

@router.post("/{quote_id}/accept", response_model=APIResponse)
async def accept_quote(
    quote_id: str,
    current_user: dict = Depends(require_roles(["COLLECTOR"]))
):
    result = quote_service.accept_quote(quote_id, current_user["uid"])
    return APIResponse(success=True, message="Quote accepted", data=result)