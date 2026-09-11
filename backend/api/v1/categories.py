from fastapi import APIRouter, Depends
from core.security import require_roles, get_current_user
from schemas.category import CategoryCreate
from schemas.common import APIResponse
from services.category_service import CategoryService

router = APIRouter()
category_service = CategoryService()

# Only ADMIN can create categories
@router.post("/", response_model=APIResponse)
async def create_category(
    category_in: CategoryCreate,
    current_user: dict = Depends(require_roles(["ADMIN"]))
):
    result = category_service.create_category(category_in)
    return APIResponse(success=True, message="Category created successfully", data=result)

# ANY authenticated user (Admin, Collector, Recycler) can view categories
@router.get("/", response_model=APIResponse)
async def get_categories(
    current_user: dict = Depends(get_current_user)
):
    categories = category_service.get_categories()
    return APIResponse(success=True, message="Categories fetched successfully", data=categories)