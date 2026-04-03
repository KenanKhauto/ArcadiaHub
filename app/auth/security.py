"""Security helpers for authentication."""

import hashlib
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _normalize_password(password: str) -> str:
    """
    Normalize password before bcrypt hashing to avoid the 72-byte bcrypt limit.

    Args:
        password: Raw password string.

    Returns:
        SHA-256 hex digest of the password.
    """
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    """
    Hash a password safely.

    Args:
        password: Raw password string.

    Returns:
        Bcrypt hash of the normalized password.
    """
    normalized = _normalize_password(password)
    return pwd_context.hash(normalized)


def verify_password(plain_password: str, password_hash: str) -> bool:
    """
    Verify a password against a stored hash.

    Args:
        plain_password: Raw password string.
        password_hash: Stored password hash.

    Returns:
        True if valid, otherwise False.
    """
    normalized = _normalize_password(plain_password)
    return pwd_context.verify(normalized, password_hash)