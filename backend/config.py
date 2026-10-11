
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from sqlalchemy.engine import URL

load_dotenv()


class Settings(BaseSettings):
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "forge_insight")

    # Enable TLS for the hosted TiDB database in production.
    DB_SSL: bool = os.getenv("DB_SSL", "false").lower() == "true"
    DB_SSL_CA: str = os.getenv("DB_SSL_CA", "")

    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    FRONTEND_ORIGIN: str = os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:8443"
    )

    @property
    def database_url(self) -> URL:
        return URL.create(
            drivername="mysql+pymysql",
            username=self.DB_USER,
            password=self.DB_PASSWORD,
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_NAME,
            query={"charset": "utf8mb4"},
        )


settings = Settings()
