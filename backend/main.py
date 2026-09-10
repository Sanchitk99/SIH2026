from fastapi import FastAPI
from core.config import settings
from api.v1 import lots

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.include_router(lots.router, prefix=f"{settings.API_V1_STR}/lots", tags=["Lots"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}