from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kabadiwala Connect API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    FIREBASE_CREDENTIALS_PATH: str
    
    class Config:
        env_file = ".env"

settings = Settings()