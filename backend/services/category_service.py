from repositories.category_repository import CategoryRepository
from schemas.category import CategoryCreate

class CategoryService:
    def __init__(self):
        self.category_repo = CategoryRepository()

    def create_category(self, category_in: CategoryCreate) -> dict:
        return self.category_repo.create(category_in.model_dump())

    def get_categories(self) -> list[dict]:
        return self.category_repo.get_all()