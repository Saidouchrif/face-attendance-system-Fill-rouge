"""
App package bootstrap.

Loads environment variables exactly once so every module (routes, services,
workers) gets the same configuration regardless of the working directory or
how uvicorn is launched (Windows, Linux, Docker, etc.).
"""

from pathlib import Path

from dotenv import load_dotenv

APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent

ENV_FILES = [
    BACKEND_DIR / ".env.local",
    BACKEND_DIR / ".env",
    APP_DIR / ".env.local",
    APP_DIR / ".env",
]

for env_path in ENV_FILES:
    if env_path.is_file():
        load_dotenv(env_path, override=False)
        break
