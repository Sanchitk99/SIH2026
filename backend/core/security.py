from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from core.firebase import db

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required", headers={"WWW-Authenticate": "Bearer"})
    token = credentials.credentials
    
    # 1. Verify Token (Only catch Firebase Auth errors here)
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get('uid')
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 2. Fetch User from Firestore (Outside the try-catch block)
    user_doc = db.collection('users').document(uid).get()
    
    if not user_doc.exists:
        raise HTTPException(
            status_code=404, 
            detail="User profile not found"
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

def verify_firebase_token_only(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifies token without checking Firestore (Used for Registration only)"""
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
