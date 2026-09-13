from repositories.quote_repository import QuoteRepository
from schemas.quote import QuoteCreate
from core.firebase import db
from fastapi import HTTPException

class QuoteService:
    def __init__(self):
        self.quote_repo = QuoteRepository()

    def submit_quote(self, recycler_id: str, quote_in: QuoteCreate) -> dict:
        lot_ref = db.collection('material_lots').document(quote_in.lot_id)
        lot = lot_ref.get()
        
        if not lot.exists or lot.to_dict().get("status") != "AVAILABLE":
            raise HTTPException(status_code=400, detail="Lot is not available for bidding")

        existing_quotes = self.quote_repo.get_by_lot_and_recycler(quote_in.lot_id, recycler_id)
        if any(quote.get("status") in {"PENDING", "ACCEPTED"} for quote in existing_quotes):
            raise HTTPException(status_code=409, detail="You already submitted a quote for this lot")

        quote_data = quote_in.model_dump()
        quote_data.update({
            "recycler_id": recycler_id,
            "status": "PENDING"
        })
        
        result = self.quote_repo.create(quote_data)
        lot_ref.update({"status": "QUOTED"})
        return result

    def get_quotes_for_lot(self, lot_id: str, collector_id: str) -> list[dict]:
        lot = db.collection('material_lots').document(lot_id).get()
        if not lot.exists or lot.to_dict().get("collector_id") != collector_id:
            raise HTTPException(status_code=403, detail="Not authorized to view these quotes")
            
        return self.quote_repo.get_by_lot(lot_id)
        
    def accept_quote(self, quote_id: str, collector_id: str):
        quote_doc = db.collection('quotes').document(quote_id).get()
        if not quote_doc.exists:
            raise HTTPException(status_code=404, detail="Quote not found")
            
        quote_data = quote_doc.to_dict()
        lot_id = quote_data["lot_id"]
        
        lot_ref = db.collection('material_lots').document(lot_id)
        if lot_ref.get().to_dict().get("collector_id") != collector_id:
            raise HTTPException(status_code=403, detail="Not authorized to accept this quote")

        if quote_data.get("status") == "ACCEPTED":
            existing = self._get_transaction_for_quote(quote_id)
            return existing or {"message": "Quote already accepted"}

        if quote_data.get("status") != "PENDING":
            raise HTTPException(status_code=400, detail="This quote is no longer available")

        lot_snapshot = lot_ref.get()
        if not lot_snapshot.exists or lot_snapshot.to_dict().get("status") != "QUOTED":
            raise HTTPException(status_code=400, detail="This item is no longer available")

        all_quotes = self.quote_repo.get_by_lot(lot_id)
        for q in all_quotes:
            status = "ACCEPTED" if q["id"] == quote_id else "REJECTED"
            self.quote_repo.update_status(q["id"], status)

        lot_ref.update({"status": "HANDOVER_PENDING"})
        
        # ==========================================
        # NEW CODE ADDED HERE: Creates the transaction
        # ==========================================
        tx_repo = __import__('repositories.transaction_repository').transaction_repository.TransactionRepository()
        existing_transaction = tx_repo.get_by_quote(quote_id)
        if existing_transaction:
            return existing_transaction[0]
        tx_data = {
            "lot_id": lot_id,
            "collector_id": collector_id,
            "recycler_id": quote_data["recycler_id"],
            "quote_id": quote_id,
            "transaction_status": "HANDOVER_PENDING",
            "payment_status": "PENDING"
        }
        tx_repo.create(tx_data)
        # ==========================================

        return {"message": "Quote accepted successfully. Ready for handover."}

    def _get_transaction_for_quote(self, quote_id: str) -> dict | None:
        from repositories.transaction_repository import TransactionRepository
        transactions = TransactionRepository().get_by_quote(quote_id)
        return transactions[0] if transactions else None
