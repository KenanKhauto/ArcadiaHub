"""Pydantic schemas for authentication."""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Request schema for user registration."""

    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)
    email: EmailStr | None = None
    display_name: str | None = Field(default=None, max_length=100)


class LoginRequest(BaseModel):
    """Request schema for user login."""

    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)


class UserResponse(BaseModel):
    """Response schema for user information."""

    id: int
    username: str
    email: str | None = None
    display_name: str | None = None

    model_config = {"from_attributes": True}