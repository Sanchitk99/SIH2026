from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kabadiwala Connect"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # ADD THIS LINE:
    firebase_credentials_path: str = "./sih2026.json"
    ROBOFLOW_API_KEY: str

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()