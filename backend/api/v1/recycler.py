from fastapi import APIRouter, Depends, HTTPException
from core.security import require_roles
from schemas.recycler import RecyclerProfileUpdate, RecyclerPreferences
from schemas.common import APIResponse
from core.firebase import db
from datetime import datetime, timezone

router = APIRouter()

@router.get("/profile", response_model=APIResponse)
async def get_recycler_profile(
    current_user: dict = Depends(require_roles(["RECYCLER"]))
):
    recycler_doc = db.collection('recyclers').document(current_user['uid']).get()
    profile_data = current_user.copy()
    if recycler_doc.exists:
        profile_data.update(recycler_doc.to_dict())
    return APIResponse(success=True, message="Recycler profile fetched", data=profile_data)

@router.put("/profile", response_model=APIResponse)
async def update_recycler_profile(
    profile_in: RecyclerProfileUpdate,
    current_user: dict = Depends(require_roles(["RECYCLER"]))
):
    uid = current_user['uid']
    recycler_ref = db.collection('recyclers').document(uid)
    
    update_data = profile_in.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if not recycler_ref.get().exists:
        update_data["user_id"] = uid
        update_data["authorization_status"] = "PENDING"
        update_data["created_at"] = update_data["updated_at"]
        recycler_ref.set(update_data)
    else:
        recycler_ref.update(update_data)
        
    return APIResponse(success=True, message="Recycler profile updated", data=update_data)


@router.post("/preferences", response_model=APIResponse)
async def update_preferences(
    prefs_in: RecyclerPreferences,
    current_user: dict = Depends(require_roles(["RECYCLER"]))
):
    uid = current_user['uid']
    recycler_ref = db.collection('recyclers').document(uid)
    
    if not recycler_ref.get().exists:
        raise HTTPException(status_code=404, detail="Recycler profile not setup yet")
        
    update_data = {
        "accepted_categories": prefs_in.accepted_categories,
        "rates": [rate.model_dump() for rate in prefs_in.rates],
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    recycler_ref.update(update_data)
    
    return APIResponse(success=True, message="Recycler preferences updated", data=update_data)
