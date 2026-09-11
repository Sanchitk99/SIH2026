from repositories.base_repository import BaseRepository

class CategoryRepository(BaseRepository):
    def __init__(self):
        super().__init__('material_categories')

    def create(self, category_data: dict) -> dict:
        cat_id = self.generate_id()
        category_data['created_at'] = self.get_timestamp()
        category_data['updated_at'] = category_data['created_at']
        
        self.collection.document(cat_id).set(category_data)
        category_data['id'] = cat_id
        return category_data

    def get_all(self) -> list[dict]:
        docs = self.collection.stream()
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]