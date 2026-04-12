# AurixCube

AurixCube is a browser-based social game platform built with FastAPI and server-rendered Jinja templates.
It combines real-time multiplayer party games with account profiles, friend management, and in-app game invites.

## What This Project Includes

- User authentication and session-based login
- Profile management (username, display name, email, password, avatar)
- Friend requests and friends list
- In-app game invite notifications
- Multiple multiplayer games in one hub

## Games

- `Bluff` (`/games/bluff`)
- `Who Am I?` (`/games/who-am-i`)
- `Draw & Guess` (`/games/draw-guess`)
- `Undercover` is present in the codebase and API routes, with availability controlled by UI/game registry flags

## Tech Stack

- Backend: FastAPI, SQLAlchemy
- Frontend: Jinja2 templates, vanilla JavaScript, HTML/CSS
- Database: SQLite (local default) or PostgreSQL (production)
- Room state store: in-memory or Redis
- Profile image storage: local filesystem or S3-compatible object storage (AWS S3 / Cloudflare R2)

## Local Development

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the app:

```bash
python run.py
```

App runs on `http://localhost:8000`.

## Environment Variables

### Core

- `APP_NAME` (optional, default `AurixCube`)
- `DEBUG` (set `false` in production)
- `SESSION_SECRET_KEY` (required in production)
- `DATABASE_URL` (required for production DB)

### Room Storage (Redis)

- `USE_REDIS_FOR_ROOMS` (`true` / `false`)
- `REDIS_URL` (required if Redis is enabled)
- `ROOM_TTL_SECONDS` (default `21600`)

### Profile Image Storage

- `PROFILE_IMAGE_STORAGE_BACKEND` = `local` or `s3`

If `local`:

- `PROFILE_IMAGE_LOCAL_DIR`
- `PROFILE_IMAGE_LOCAL_BASE_URL`

If `s3`:

- `PROFILE_IMAGE_S3_BUCKET`
- `PROFILE_IMAGE_S3_REGION`
- `PROFILE_IMAGE_S3_PREFIX` (default `profile_uploads`)
- `PROFILE_IMAGE_S3_PUBLIC_BASE_URL` (public base URL for browser access)
- `PROFILE_IMAGE_S3_ENDPOINT_URL` (required for S3-compatible providers such as Cloudflare R2)
- `AWS_ACCESS_KEY_ID` (for S3/R2 API access)
- `AWS_SECRET_ACCESS_KEY` (for S3/R2 API access)

For Cloudflare R2, `PROFILE_IMAGE_S3_REGION=auto` is the typical value.

## Profile Image Notes

- Max upload size is 5 MB
- Allowed extensions: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- URLs are stored in `users.profile_image`
- Frontend falls back to `profile_img_default.png` when an avatar URL fails to load

## Data Initialization

On startup, the app creates missing tables and applies lightweight compatibility checks:

- Ensures `users.profile_image` column exists
- Ensures `friends.status` column exists

For long-term production schema management, migrate to Alembic migrations.

## License

AurixCube Proprietary License v1.0

This project is proprietary software. Unauthorized use, copying, modification, or distribution is strictly prohibited.

