"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.web.router import router as web_router
from app.games.undercover.router import router as undercover_router

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.mount("/static", StaticFiles(directory="app/web/static"), name="static")

app.include_router(web_router)
app.include_router(undercover_router, prefix="/api/undercover", tags=["Undercover"])