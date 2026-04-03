"""Database initialization helper."""

from app.db.base import Base
from app.db.models import User  # noqa: F401
from app.db.session import engine


def init_db() -> None:
    """
    Create database tables.

    For now this uses SQLAlchemy create_all.
    Later you should replace this with Alembic migrations.
    """
    Base.metadata.create_all(bind=engine)