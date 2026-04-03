"""Authentication dependencies."""

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.auth.service import AuthService
from app.db.session import get_db
from app.db.models.user import User

auth_service = AuthService()


def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db),
) -> User | None:
    """
    Return the currently logged-in user if present.

    Args:
        request: FastAPI request object.
        db: Database session.

    Returns:
        The current user or None.
    """
    user_id = request.session.get("user_id")
    if not user_id:
        return None

    return auth_service.get_user_by_id(db, user_id)


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """
    Return the currently logged-in user.

    Raises:
        HTTPException: If the user is not authenticated.
    """
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    user = auth_service.get_user_by_id(db, user_id)
    if not user:
        request.session.clear()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session.",
        )

    return user