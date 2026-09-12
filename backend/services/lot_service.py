from repositories.lot_repository import LotRepository
from schemas.lot import LotCreate
from models.enums import LotStatus
from datetime import datetime

class LotService:
    def __init__(self):
        self.lot_repo = LotRepository()

    def generate_lot_reference(self) -> str:
        # Implementation of utils/reference_generator.py logic
        import time
        return f"LOT-{datetime.now().year}-{int(time.time())}"

    def create_lot(self, user_id: str, lot_in: LotCreate) -> dict:
        lot_id = self.lot_repo.generate_id()
        lot_data = lot_in.model_dump()
        
        lot_data.update({
            "id": lot_id,
            "lot_reference": self.generate_lot_reference(),
            "collector_id": user_id,
            "status": LotStatus.AVAILABLE.value
        })
        
        return self.lot_repo.create(lot_id, lot_data)

    def get_collector_lots(self, user_id: str) -> list[dict]:
        lots = self.lot_repo.get_by_collector(user_id)
        # Safety fallback at the service layer
        return lots if lots is not None else []


# from repositories.lot_repository import LotRepository
# from schemas.lot import LotCreate
# from models.enums import LotStatus
# from datetime import datetime

# class LotService:
#     def __init__(self):
#         self.lot_repo = LotRepository()

#     def generate_lot_reference(self) -> str:
#         # Implementation of utils/reference_generator.py logic
#         import time
#         return f"LOT-{datetime.now().year}-{int(time.time())}"

#     def create_lot(self, user_id: str, lot_in: LotCreate) -> dict:
#         lot_id = self.lot_repo.generate_id()
#         lot_data = lot_in.model_dump()
        
#         lot_data.update({
#             "lot_reference": self.generate_lot_reference(),
#             "collector_id": user_id,
#             "status": LotStatus.AVAILABLE.value
#         })
        
#         return self.lot_repo.create(lot_id, lot_data)

#     def get_collector_lots(self, user_id: str) -> list[dict]:
#         return self.lot_repo.get_by_collector(user_id)