from repositories.transaction_repository import TransactionRepository
from core.firebase import db
from fastapi import HTTPException
from schemas.transaction import HandoverRecord

class TransactionService:
    def __init__(self):
        self.tx_repo = TransactionRepository()

    def get_user_transactions(self, user_id: str, role: str) -> list[dict]:
        transactions = self.tx_repo.get_by_user(user_id, role)
        enriched_transactions = []
        for transaction in transactions:
            lot_snapshot = db.collection('material_lots').document(transaction['lot_id']).get()
            quote_snapshot = db.collection('quotes').document(transaction['quote_id']).get()
            lot_data = lot_snapshot.to_dict() if lot_snapshot.exists else {}
            quote_data = quote_snapshot.to_dict() if quote_snapshot.exists else {}
            enriched_transactions.append({
                **transaction,
                'material_category_name': lot_data.get('material_category_name'),
                'material_description': lot_data.get('material_description'),
                'approximate_weight': lot_data.get('approximate_weight'),
                'weight_unit': lot_data.get('weight_unit', 'kg'),
                'condition': lot_data.get('condition'),
                'quoted_price': quote_data.get('quoted_price'),
                'pickup_available': quote_data.get('pickup_available'),
                'estimated_pickup_date': quote_data.get('estimated_pickup_date'),
            })
        return enriched_transactions

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
        # Handover completion does not confirm payment. Preserve the current
        # state until a real payment integration updates it.
        update_data["payment_status"] = tx.to_dict().get("payment_status", "PENDING")
        
        self.tx_repo.update(tx_id, update_data)
        
        # Mark the original lot as completed
        lot_id = tx.to_dict().get("lot_id")
        db.collection('material_lots').document(lot_id).update({"status": "COMPLETED"})
        
        return {"message": "Handover successful and transaction completed"}
