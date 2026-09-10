from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from core.firebase import db

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    # 1. Verify Token (Only catch Firebase Auth errors here)
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get('uid')
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}"
        )
        
    # 2. Fetch User from Firestore (Outside the try-catch block)
    user_doc = db.collection('users').document(uid).get()
    
    if not user_doc.exists:
        raise HTTPException(
            status_code=404, 
            detail=f"User profile not found in Firestore for UID: {uid}"
        )
        
    user_data = user_doc.to_dict()
    user_data['uid'] = uid
        
    if not user_data.get('is_active', False):
        raise HTTPException(status_code=403, detail="Inactive user account")
        
    return user_data

def require_roles(allowed_roles: list[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get('role') not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for this user role"
            )
        return current_user
    return role_checker