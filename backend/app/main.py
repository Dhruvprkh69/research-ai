from pathlib import Path
import sys
import os
from dotenv import load_dotenv

# Ensure project root (where services module lives) is on sys.path
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

# Load .env from project root before importing services
env_path = ROOT_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import health, citations, papers, ask_about


def create_app() -> FastAPI:
    app = FastAPI(title="Research AI Backend", version="0.1.0")
    
    # Add CORS middleware to allow frontend requests
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(health.router, prefix="/api")
    app.include_router(citations.router, prefix="/api")
    app.include_router(papers.router, prefix="/api")
    app.include_router(ask_about.router, prefix="/api")
    return app


app = create_app()

