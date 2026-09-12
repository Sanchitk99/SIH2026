from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.v1 import lots, categories, collector, auth, recycler, admin, quotes, transactions, upload, ai

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

origins = [
    "http://localhost:5173",  # Vite frontend local development
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Allows specific origins
    allow_credentials=True,         # Allows cookies / bearer tokens
    allow_methods=["*"],            # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],            # Allows all headers (Authorization, Content-Type, etc.)
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
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI & Machine Learning"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}