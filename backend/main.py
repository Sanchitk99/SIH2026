from fastapi import FastAPI
from core.config import settings
from api.v1 import lots, categories, collector, auth, recycler, admin, quotes, transactions, upload

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Register API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(lots.router, prefix=f"{settings.API_V1_STR}/lots", tags=["Lots"])
app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/categories", tags=["Material Categories"])
app.include_router(collector.router, prefix=f"{settings.API_V1_STR}/collector", tags=["Collector Profile"])
app.include_router(recycler.router, prefix=f"{settings.API_V1_STR}/recycler", tags=["Recycler Operations"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin Dashboard"])
app.include_router(quotes.router, prefix=f"{settings.API_V1_STR}/quotes", tags=["Quotes"])
app.include_router(transactions.router, prefix=f"{settings.API_V1_STR}/transactions", tags=["Transactions"])
app.include_router(upload.router, prefix=f"{settings.API_V1_STR}/upload", tags=["File Uploads"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}