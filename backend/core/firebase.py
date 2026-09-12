import firebase_admin
from firebase_admin import credentials, firestore, storage
from core.config import settings

# Initialize Firebase Admin SDK
cred = credentials.Certificate(settings.firebase_credentials_path)
firebase_app = firebase_admin.initialize_app(cred, {
    'storageBucket': 'sih2026-cf2c0.appspot.com'
})

db = firestore.client()
bucket = storage.bucket()