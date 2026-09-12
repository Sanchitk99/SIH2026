from fastapi import APIRouter, Depends, UploadFile, File, Form
from core.security import get_current_user
from schemas.common import APIResponse
from services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

@router.post("/classify-image", response_model=APIResponse)
async def classify_ewaste_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    image_bytes = await file.read()
    result = ai_service.predict_ewaste_category(image_bytes)
    
    return APIResponse(
        success=True, 
        message="Image classified successfully", 
        data=result
    )

@router.post("/predict-price", response_model=APIResponse)
async def predict_ewaste_price(
    category: str = Form(...),
    weight_kg: float = Form(...),
    condition: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    result = ai_service.predict_price(category, weight_kg, condition)
    
    return APIResponse(
        success=True, 
        message="Price predicted successfully", 
        data=result
    )