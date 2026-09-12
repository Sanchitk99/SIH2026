from repositories.base_repository import BaseRepository

class QuoteRepository(BaseRepository):
    def __init__(self):
        super().__init__('quotes')

    def create(self, quote_data: dict) -> dict:
        quote_id = self.generate_id()
        quote_data['created_at'] = self.get_timestamp()
        quote_data['updated_at'] = quote_data['created_at']
        
        self.collection.document(quote_id).set(quote_data)
        quote_data['id'] = quote_id
        return quote_data

    def get_by_lot(self, lot_id: str) -> list[dict]:
        docs = self.collection.where('lot_id', '==', lot_id).stream()
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]

    def get_by_lot_and_recycler(self, lot_id: str, recycler_id: str) -> list[dict]:
        docs = self.collection.where('lot_id', '==', lot_id).where('recycler_id', '==', recycler_id).stream()
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]
        
    def update_status(self, quote_id: str, status: str):
        self.collection.document(quote_id).update({
            "status": status,
            "updated_at": self.get_timestamp()
        })
