from sqlalchemy import inspect
from sqlalchemy.exc import OperationalError
import pytest

from app.db.session import engine

EXPECTED_TABLES = {
    "admins",
    "employes",
    "presences",
    "rapports",
    "face_templates",
}


def test_all_expected_tables_exist():

    try:
        inspector = inspect(engine)
        existing_tables = set(inspector.get_table_names())
    except OperationalError as exc:
        pytest.fail(f"Could not inspect database schema: {exc}")

    missing = EXPECTED_TABLES - existing_tables
    assert not missing, f"Missing tables: {', '.join(sorted(missing))}"
