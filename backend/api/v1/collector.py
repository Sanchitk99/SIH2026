from fastapi import APIRouter, Depends
from core.security import require_roles
from schemas.common import APIResponse
from core.firebase import db

router = APIRouter()

@router.get("/profile", response_model=APIResponse)
async def get_collector_profile(
    current_user: dict = Depends(require_roles(["COLLECTOR"]))
):
    # Fetch additional collector-specific data if it exists
    collector_doc = db.collection('collectors').document(current_user['uid']).get()
    
    profile_data = current_user.copy()
    if collector_doc.exists:
        profile_data.update(collector_doc.to_dict())
        
    return APIResponse(
        success=True, 
        message="Collector profile fetched", 
        data=profile_data
    )