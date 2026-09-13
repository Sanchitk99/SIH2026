from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from core.security import get_current_user
from schemas.common import APIResponse
from services.ai_service import AIService

router = APIRouter()
ai_service = AIService()
MAX_IMAGE_SIZE = 10 * 1024 * 1024

@router.post("/classify-image", response_model=APIResponse)
async def classify_ewaste_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=415, detail="Unsupported image type")
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="Uploaded image is too large")
    try:
        result = ai_service.predict_ewaste_category(image_bytes)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    
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
    raise HTTPException(status_code=503, detail="Price prediction is not available")
