from core.firebase import db
from datetime import datetime, timezone

class BaseRepository:
    def __init__(self, collection_name: str):
        self.collection = db.collection(collection_name)

    def generate_id(self):
        return self.collection.document().id

    def get_timestamp(self):
        return datetime.now(timezone.utc).isoformat()