from pydantic import BaseModel
from models.enums import UserRole

class UserRegister(BaseModel):
    name: str
    phone: str
    role: UserRole
    preferred_language: str = "en"

class UserProfileResponse(UserRegister):
    uid: str
    email: str
    is_active: bool
    created_at: str
    updated_at: str