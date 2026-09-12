from fastapi import APIRouter, Depends, HTTPException
from core.security import get_current_user, verify_firebase_token_only
from core.firebase import db
from schemas.auth import UserRegister
from schemas.common import APIResponse
from datetime import datetime, timezone

router = APIRouter()

@router.post("/register", response_model=APIResponse)
async def register_user(
    user_in: UserRegister,
    firebase_user: dict = Depends(verify_firebase_token_only)
):
    uid = firebase_user.get("uid")
    email = firebase_user.get("email", "")
    
    # Public users cannot register as ADMIN
    if user_in.role == "ADMIN":
        raise HTTPException(status_code=403, detail="Admin registration not allowed here")

    user_ref = db.collection('users').document(uid)
    existing_doc = user_ref.get()
    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    # Preserve creation date if the user document already exists, otherwise set it
    created_at = existing_doc.to_dict().get("created_at", timestamp) if existing_doc.exists else timestamp

    user_data = {
        "name": user_in.name,
        "email": email,
        "phone": user_in.phone,
        "role": user_in.role.value,
        "preferred_language": user_in.preferred_language,
        "is_active": True,
        "created_at": created_at,
        "updated_at": timestamp
    }
    
    # Use merge=True to safely upsert and fix the race condition
    user_ref.set(user_data, merge=True)
    user_data["uid"] = uid
    
    return APIResponse(success=True, message="User registered successfully", data=user_data)

@router.get("/me", response_model=APIResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return APIResponse(success=True, message="Current user fetched", data=current_user)
    
# from fastapi import APIRouter, Depends, HTTPException
# from core.security import get_current_user, verify_firebase_token_only
# from core.firebase import db
# from schemas.auth import UserRegister
# from schemas.common import APIResponse
# from datetime import datetime, timezone

# router = APIRouter()

# @router.post("/register", response_model=APIResponse)
# async def register_user(
#     user_in: UserRegister,
#     firebase_user: dict = Depends(verify_firebase_token_only)
# ):
#     uid = firebase_user.get("uid")
#     email = firebase_user.get("email", "")
    
#     # Check if user already exists
#     user_ref = db.collection('users').document(uid)
#     if user_ref.get().exists:
#         raise HTTPException(status_code=409, detail="User already registered in database")
    
#     # Public users cannot register as ADMIN
#     if user_in.role == "ADMIN":
#         raise HTTPException(status_code=403, detail="Admin registration not allowed here")

#     timestamp = datetime.now(timezone.utc).isoformat()
    
#     user_data = {
#         "name": user_in.name,
#         "email": email,
#         "phone": user_in.phone,
#         "role": user_in.role.value,
#         "preferred_language": user_in.preferred_language,
#         "is_active": True,
#         "created_at": timestamp,
#         "updated_at": timestamp
#     }
    
#     user_ref.set(user_data)
#     user_data["uid"] = uid
    
#     return APIResponse(success=True, message="User registered successfully", data=user_data)

# @router.get("/me", response_model=APIResponse)
# async def get_me(current_user: dict = Depends(get_current_user)):
#     return APIResponse(success=True, message="Current user fetched", data=current_user)