from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URI = os.getenv("DATABASE_URI")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Acufore@root")
DB_NAME = os.getenv("DB_NAME", "pv_new_testing")

# Create database URL
if DATABASE_URI:
    database_url = DATABASE_URI
else:
    database_url = f"mysql+pymysql://root:Acufore%40root@localhost:3306/pv_new_testing"

# Create engine
engine = create_engine(database_url, echo=False)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Metadata for table creation
metadata = MetaData()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
