from sqlalchemy import text
from sqlalchemy.exc import OperationalError
import pytest

from app.db.session import engine


def test_database_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar()
    except OperationalError as exc:
        pytest.fail(f"Database connection failed: {exc}")

    assert result == 1, "Unexpected response from database"
