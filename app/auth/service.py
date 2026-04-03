"""Authentication service layer."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.schemas import RegisterRequest
from app.auth.security import hash_password, verify_password
from app.db.models.user import User


class AuthService:
    """
    Service layer for authentication-related business logic.
    """

    def get_user_by_id(self, db: Session, user_id: int) -> User | None:
        """
        Get a user by primary key.

        Args:
            db: Database session.
            user_id: User ID.

        Returns:
            The user if found, otherwise None.
        """
        return db.get(User, user_id)

    def get_user_by_username(self, db: Session, username: str) -> User | None:
        """
        Get a user by username.

        Args:
            db: Database session.
            username: Username.

        Returns:
            The user if found, otherwise None.
        """
        stmt = select(User).where(User.username == username)
        return db.execute(stmt).scalar_one_or_none()

    def create_user(self, db: Session, payload: RegisterRequest) -> User:
        """
        Create a new user.

        Args:
            db: Database session.
            payload: Registration payload.

        Returns:
            The created user.

        Raises:
            ValueError: If username is already taken.
        """
        existing_user = self.get_user_by_username(db, payload.username)
        if existing_user:
            raise ValueError("Username already exists.")

        user = User(
            username=payload.username,
            email=payload.email,
            display_name=payload.display_name or payload.username,
            password_hash=hash_password(payload.password),
        )

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def authenticate_user(self, db: Session, username: str, password: str) -> User | None:
        """
        Authenticate a user.

        Args:
            db: Database session.
            username: Username.
            password: Plain-text password.

        Returns:
            The authenticated user if credentials are valid, otherwise None.
        """
        user = self.get_user_by_username(db, username)
        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user