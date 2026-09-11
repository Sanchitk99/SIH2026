from repositories.transaction_repository import TransactionRepository
from core.firebase import db
from fastapi import HTTPException
from schemas.transaction import HandoverRecord

class TransactionService:
    def __init__(self):
        self.tx_repo = TransactionRepository()

    def get_user_transactions(self, user_id: str, role: str) -> list[dict]:
        return self.tx_repo.get_by_user(user_id, role)

    def record_handover(self, tx_id: str, recycler_id: str, handover_data: HandoverRecord) -> dict:
        tx_ref = db.collection('transactions').document(tx_id)
        tx = tx_ref.get()
        
        if not tx.exists or tx.to_dict().get("recycler_id") != recycler_id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this transaction")
            
        if tx.to_dict().get("transaction_status") != "HANDOVER_PENDING":
            raise HTTPException(status_code=400, detail="Transaction is not ready for handover")

        # Update transaction with final details
        update_data = handover_data.model_dump()
        update_data["transaction_status"] = "COMPLETED"
        update_data["payment_status"] = "PAID" # Assuming paid upon handover for MVP
        
        self.tx_repo.update(tx_id, update_data)
        
        # Mark the original lot as completed
        lot_id = tx.to_dict().get("lot_id")
        db.collection('material_lots').document(lot_id).update({"status": "COMPLETED"})
        
        return {"message": "Handover successful and transaction completed"}