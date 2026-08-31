import os
from pathlib import Path

from dotenv import load_dotenv

RAIZ_PROJETO = Path(__file__).resolve().parents[2]

load_dotenv(RAIZ_PROJETO / ".env")

class Settings:
    def __init__(self):
        self.db_host: str = os.getenv("DB_HOST")
        self.db_port: int = int(os.getenv("DB_PORT"))
        self.db_user: str = os.getenv("DB_USER")
        self.db_password: str = os.getenv("DB_PASS")
        self.db_name: str = os.getenv("DB_NAME")

        self.app_host: str = os.getenv("APP_HOST")
        self.app_port: int = int(os.getenv("APP_PORT"))


configuracoes = Settings()
