"""Routes for rendering frontend pages."""

from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

from app.games.registry import GAMES

router = APIRouter()
templates = Jinja2Templates(directory="app/web/templates")


@router.get("/")
def home(request: Request):
    """Render the home page."""
    return templates.TemplateResponse(
        request,
        "home.html",
        {"request": request, "games": GAMES},
    )


@router.get("/games")
def games_page(request: Request):
    """Render the games page."""
    return templates.TemplateResponse(
        request,
        "home.html",
        {"request": request, "games": GAMES},
    )


@router.get("/games/undercover")
def undercover_page(request: Request):
    """Render the Undercover game page."""
    return templates.TemplateResponse(
        request,
        "undercover.html",
        {"request": request},
    )


@router.get("/about")
def about_page(request: Request):
    """Render the about page."""
    return templates.TemplateResponse(
        request,
        "about.html",
        {"request": request},
    )


@router.get("/profile")
def profile_page(request: Request):
    """Render the profile page."""
    return templates.TemplateResponse(
        request,
        "profile.html",
        {"request": request},
    )