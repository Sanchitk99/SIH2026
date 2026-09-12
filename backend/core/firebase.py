import firebase_admin
from firebase_admin import credentials, firestore
from core.config import settings
from pathlib import Path

# Initialize Firebase Admin SDK
credentials_path = Path(settings.firebase_credentials_path)
if not credentials_path.is_absolute():
    credentials_path = Path(__file__).resolve().parents[1] / credentials_path

cred = credentials.Certificate(str(credentials_path))
firebase_app = firebase_admin.initialize_app(cred, {
    'storageBucket': 'sih2026-cf2c0.appspot.com'
})

db = firestore.client()
