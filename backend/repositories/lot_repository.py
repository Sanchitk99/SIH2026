from repositories.base_repository import BaseRepository

class LotRepository(BaseRepository):
    def __init__(self):
        super().__init__('material_lots')

    def create(self, lot_id: str, lot_data: dict) -> dict:
        lot_data['created_at'] = self.get_timestamp()
        lot_data['updated_at'] = lot_data['created_at']
        self.collection.document(lot_id).set(lot_data)
        return lot_data

    def get_by_collector(self, collector_id: str) -> list[dict]:
        docs = self.collection.where('collector_id', '==', collector_id).stream()
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]

    def get_all(self, status: str | None = None) -> list[dict]:
        query = self.collection
        if status:
            query = query.where('status', '==', status)

        docs = query.stream()
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]
