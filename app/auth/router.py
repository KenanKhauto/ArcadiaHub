"""Authentication routes."""

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from starlette import status

from app.auth.dependencies import get_current_user_optional
from app.auth.schemas import RegisterRequest
from app.auth.service import AuthService
from app.db.models.user import User
from app.db.session import get_db

router = APIRouter()
templates = Jinja2Templates(directory="app/web/templates")
auth_service = AuthService()


@router.get("/login")
def login_page(
    request: Request,
    current_user: User | None = Depends(get_current_user_optional),
):
    """
    Render the login page.
    """
    return templates.TemplateResponse(
        request,
        "login.html",
        {"request": request, "error": None, "current_user": current_user},
    )


@router.post("/login")
def login_user(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """
    Authenticate a user and create a session.
    """
    user = auth_service.authenticate_user(db, username=username, password=password)
    if not user:
        return templates.TemplateResponse(
            request,
            "login.html",
            {
                "request": request,
                "error": "اسم المستخدم أو كلمة المرور غير صحيحة.",
                "current_user": current_user,
            },
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    request.session["user_id"] = user.id
    return RedirectResponse(url="/profile", status_code=status.HTTP_303_SEE_OTHER)


@router.get("/register")
def register_page(
    request: Request,
    current_user: User | None = Depends(get_current_user_optional),
):
    """
    Render the registration page.
    """
    return templates.TemplateResponse(
        request,
        "register.html",
        {"request": request, "error": None, "current_user": current_user},
    )


@router.post("/register")
def register_user(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    email: str = Form(default=""),
    display_name: str = Form(default=""),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """
    Register a new user and log them in immediately.
    """
    payload = RegisterRequest(
        username=username,
        password=password,
        email=email or None,
        display_name=display_name or None,
    )

    try:
        user = auth_service.create_user(db, payload)
    except ValueError as exc:
        return templates.TemplateResponse(
            request,
            "register.html",
            {
                "request": request,
                "error": str(exc),
                "current_user": current_user,
            },
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    request.session["user_id"] = user.id
    return RedirectResponse(url="/profile", status_code=status.HTTP_303_SEE_OTHER)


@router.post("/logout")
def logout_user(request: Request):
    """
    Log out the current user by clearing the session.
    """
    request.session.clear()
    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)