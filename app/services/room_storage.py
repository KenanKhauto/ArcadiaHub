"""Room storage provider and repository selection."""

from __future__ import annotations

from functools import lru_cache

from app.config import settings
from app.repositories.in_memory_room_repository import InMemoryRoomRepository
from app.repositories.redis_room_repository import RedisRoomRepository
from app.repositories.room_repository import RoomRepository


@lru_cache(maxsize=1)
def get_room_repository() -> RoomRepository:
    """
    Return the configured room repository implementation.

    Uses Redis when enabled, otherwise falls back to in-memory storage.
    """
    if settings.use_redis_for_rooms:
        return RedisRoomRepository(
            redis_url=settings.redis_url,
            ttl_seconds=settings.room_ttl_seconds,
        )

    return InMemoryRoomRepository()