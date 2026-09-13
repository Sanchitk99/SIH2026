from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kabadiwala Connect"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # ADD THIS LINE:
    firebase_credentials_path: str = "./sih2026.json"
    ROBOFLOW_API_KEY: str | None = None
    ROBOFLOW_TIMEOUT_SECONDS: float = 30.0
    ROBOFLOW_RETRIES: int = 2

    # Supabase Storage is used for uploaded lot images and recycler documents.
    # Keep the service-role key on the backend only; never put it in frontend/.env.
    SUPABASE_URL: str | None = None
    SUPABASE_SECRET_KEY: str | None = None
    # Legacy fallback; SUPABASE_SECRET_KEY is preferred for new projects.
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    SUPABASE_STORAGE_BUCKET: str = "ewaste-images"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
