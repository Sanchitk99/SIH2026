from pydantic import BaseModel

class CategoryCreate(BaseModel):
    name: str
    description: str
    is_active: bool = True

class CategoryResponse(CategoryCreate):
    id: str
    created_at: str
    updated_at: str