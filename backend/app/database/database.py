from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Always store the database in the backend/ folder, no matter
# which directory the server is launched from.
BACKEND_DIR = Path(__file__).resolve().parents[2]

DATABASE_URL = f"sqlite:///{BACKEND_DIR / 'hydronutri.db'}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()