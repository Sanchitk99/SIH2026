from fastapi import APIRouter, Depends, HTTPException
from core.security import require_roles
from schemas.common import APIResponse
from core.firebase import db

router = APIRouter()

@router.get("/users", response_model=APIResponse)
async def list_all_users(current_user: dict = Depends(require_roles(["ADMIN"]))):
    docs = db.collection('users').stream()
    users = [{**doc.to_dict(), "uid": doc.id} for doc in docs]
    return APIResponse(success=True, message="Users fetched", data=users)

@router.put("/recyclers/{recycler_id}/authorize", response_model=APIResponse)
async def authorize_recycler(
    recycler_id: str,
    status: str, # e.g., VERIFIED, REJECTED, SUSPENDED
    current_user: dict = Depends(require_roles(["ADMIN"]))
):
    valid_statuses = ["VERIFIED", "REJECTED", "SUSPENDED", "PENDING"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid authorization status")

    recycler_ref = db.collection('recyclers').document(recycler_id)
    if not recycler_ref.get().exists:
        raise HTTPException(status_code=404, detail="Recycler profile not found")
        
    recycler_ref.update({"authorization_status": status})
    
    return APIResponse(success=True, message=f"Recycler status updated to {status}")

@router.get("/dashboard", response_model=APIResponse)
async def get_dashboard_stats(current_user: dict = Depends(require_roles(["ADMIN"]))):
    # Note: In a large production app, use Firestore Aggregation queries. 
    # This is an MVP approach.
    users_docs = db.collection('users').stream()
    lots_docs = db.collection('material_lots').stream()
    tx_docs = db.collection('transactions').where('transaction_status', '==', 'COMPLETED').stream()
    
    users_count = len(list(users_docs))
    lots_count = len(list(lots_docs))
    tx_count = len(list(tx_docs))
    
    return APIResponse(success=True, message="Dashboard stats fetched", data={
        "total_users_registered": users_count,
        "total_lots_created": lots_count,
        "total_completed_transactions": tx_count
    })