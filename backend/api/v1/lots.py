from fastapi import APIRouter, Depends, HTTPException
from core.security import require_roles
from schemas.lot import LotCreate, LotResponse
from schemas.common import APIResponse
from services.lot_service import LotService

router = APIRouter()
lot_service = LotService()

@router.post("/", response_model=APIResponse)
async def create_lot(
    lot_in: LotCreate,
    current_user: dict = Depends(require_roles(["COLLECTOR"]))
):
    result = lot_service.create_lot(current_user["uid"], lot_in)
    return APIResponse(
        success=True,
        message="Material lot created successfully",
        data=result
    )

# 1. Changed route to "/collector/me" to match your frontend API calls
@router.get("/collector/me", response_model=APIResponse)
async def get_my_lots(
    current_user: dict = Depends(require_roles(["COLLECTOR"]))
):
    try:
        lots = lot_service.get_collector_lots(current_user["uid"])
        
        # Ensure it always returns a list, even if the database returns None
        if not lots:
            lots = []
            
        return APIResponse(
            success=True,
            message="Fetched lots successfully",
            data=lots
        )
    except HTTPException as e:
        # 2. If the repository throws a 404 Not Found, intercept it and return an empty array
        if e.status_code == 404:
            return APIResponse(
                success=True,
                message="No lots created yet",
                data=[]
            )
        raise e

# from fastapi import APIRouter, Depends
# from core.security import require_roles
# from schemas.lot import LotCreate, LotResponse
# from schemas.common import APIResponse
# from services.lot_service import LotService

# router = APIRouter()
# lot_service = LotService()

# @router.post("/", response_model=APIResponse)
# async def create_lot(
#     lot_in: LotCreate,
#     current_user: dict = Depends(require_roles(["COLLECTOR"]))
# ):
#     result = lot_service.create_lot(current_user["uid"], lot_in)
#     return APIResponse(
#         success=True,
#         message="Material lot created successfully",
#         data=result
#     )

# @router.get("/", response_model=APIResponse)
# async def get_my_lots(
#     current_user: dict = Depends(require_roles(["COLLECTOR"]))
# ):
#     lots = lot_service.get_collector_lots(current_user["uid"])
#     return APIResponse(
#         success=True,
#         message="Fetched lots successfully",
#         data=lots
#     )