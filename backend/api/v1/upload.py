from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from core.security import require_roles
from schemas.common import APIResponse
from services.storage_service import StorageService
from core.firebase import db

router = APIRouter()
storage_service = StorageService()

@router.post("/lots/{lot_id}/image", response_model=APIResponse)
async def upload_lot_image(
    lot_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_roles(["COLLECTOR"]))
):
    # Verify the collector owns this lot before allowing uploads
    lot_ref = db.collection('material_lots').document(lot_id)
    lot = lot_ref.get()
    
    if not lot.exists or lot.to_dict().get("collector_id") != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to upload images for this lot")

    # Upload to 'lots' folder in Supabase Storage
    image_url = await storage_service.upload_image(file, "lots")
    
    # Save the new image URL into the lot document
    existing_images = lot.to_dict().get("images", [])
    existing_images.append(image_url)
    lot_ref.update({"images": existing_images})
    
    return APIResponse(
        success=True, 
        message="Image uploaded successfully", 
        data={"image_url": image_url, "total_images": len(existing_images)}
    )

@router.post("/recycler/document", response_model=APIResponse)
async def upload_auth_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_roles(["RECYCLER"]))
):
    # Upload to 'documents' folder in Supabase Storage
    doc_url = await storage_service.upload_image(file, "documents")
    
    # Save to recycler profile
    db.collection('recyclers').document(current_user["uid"]).set({
        "authorization_document_url": doc_url
    }, merge=True)
    
    return APIResponse(success=True, message="Document uploaded", data={"url": doc_url})
