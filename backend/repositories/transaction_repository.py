from repositories.base_repository import BaseRepository

class TransactionRepository(BaseRepository):
    def __init__(self):
        super().__init__('transactions')

    def create(self, tx_data: dict) -> dict:
        tx_id = self.generate_id()
        tx_data['created_at'] = self.get_timestamp()
        tx_data['updated_at'] = tx_data['created_at']
        
        self.collection.document(tx_id).set(tx_data)
        tx_data['id'] = tx_id
        return tx_data

    def get_by_user(self, user_id: str, role: str) -> list[dict]:
        field = 'collector_id' if role == 'COLLECTOR' else 'recycler_id'
        docs = self.collection.where(field, '==', user_id).stream()
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]
        
    def update(self, tx_id: str, data: dict):
        data['updated_at'] = self.get_timestamp()
        self.collection.document(tx_id).update(data)