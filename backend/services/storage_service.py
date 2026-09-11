from firebase_admin import storage
from fastapi import UploadFile, HTTPException
import uuid

class StorageService:
    def upload_image(self, file: UploadFile, folder: str) -> str:
        try:
            bucket = storage.bucket()
            
            # Generate a safe, unique filename
            extension = file.filename.split(".")[-1]
            file_name = f"{folder}/{uuid.uuid4()}.{extension}"
            
            # Upload to Firebase
            blob = bucket.blob(file_name)
            blob.upload_from_file(file.file, content_type=file.content_type)
            
            # Make the URL publicly viewable for the frontend
            blob.make_public()
            return blob.public_url
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")