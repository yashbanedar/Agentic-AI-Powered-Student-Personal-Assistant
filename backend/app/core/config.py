import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory or project root
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = 'Agentic AI Student Personal Assistant'
    API_V1_STR: str = '/api/v1'
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'super-secret-student-agentic-ai-key-2026-xyz-0987654321')
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # PostgreSQL primary, fallback to SQLite
    DATABASE_URL: str = os.getenv(
        'DATABASE_URL', 
        'postgresql://postgres:yash123@localhost:5432/student_assistant'
    )
    SQLITE_URL: str = 'sqlite:///./student_assistant.db'
    
    # Upload directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'uploads')
    
    # AI API Keys
    GEMINI_API_KEY: str = os.getenv('GEMINI_API_KEY', '')
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY', '')

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
