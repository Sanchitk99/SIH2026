from fastapi import UploadFile, HTTPException
from pathlib import Path
import re
import uuid

from core.config import settings
from core.supabase import get_supabase_client

class StorageService:
    MAX_FILE_SIZE = 10 * 1024 * 1024
    IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    DOCUMENT_TYPES = IMAGE_TYPES | {"application/pdf"}

    async def upload_image(self, file: UploadFile, folder: str) -> str:
        try:
            allowed_types = self.DOCUMENT_TYPES if folder == "documents" else self.IMAGE_TYPES
            if file.content_type not in allowed_types:
                raise HTTPException(status_code=415, detail="Unsupported file type")

            filename = Path(file.filename or "upload.bin")
            extension = re.sub(r"[^a-zA-Z0-9]", "", filename.suffix.removeprefix("."))
            extension = f".{extension.lower()}" if extension else ".bin"
            object_path = f"{folder}/{uuid.uuid4()}{extension}"

            contents = await file.read()
            if not contents:
                raise HTTPException(status_code=400, detail="Uploaded file is empty")
            if len(contents) > self.MAX_FILE_SIZE:
                raise HTTPException(status_code=413, detail="Uploaded file is too large")

            supabase = get_supabase_client()
            bucket = supabase.storage.from_(settings.SUPABASE_STORAGE_BUCKET)
            bucket.upload(
                path=object_path,
                file=contents,
                file_options={
                    "content-type": file.content_type or "application/octet-stream",
                    "cache-control": "3600",
                    "upsert": "false",
                },
            )

            # The bucket is intentionally public because URLs are stored in
            # Firestore and rendered later by collectors/recyclers.
            return bucket.get_public_url(object_path)

        except Exception as e:
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(status_code=503, detail="File storage is unavailable")
