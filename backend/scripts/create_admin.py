import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase_admin import auth
from core.firebase import db
from datetime import datetime, timezone

def create_initial_admin(email: str, password: str, name: str, phone: str):
    try:
        user = auth.create_user(email=email, password=password)
        db.collection('users').document(user.uid).set({
            "name": name,
            "email": email,
            "phone": phone,
            "role": "ADMIN",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        print(f"Admin created successfully with UID: {user.uid}")
    except Exception as e:
        print(f"Error creating admin: {e}")

if __name__ == "__main__":
    create_initial_admin("admin@kabadiwalaconnect.com", "SecurePassword123!", "System Admin", "+919876543210")