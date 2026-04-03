"""In-memory room repository implementation."""

from __future__ import annotations

from typing import Dict, Optional

from app.repositories.room_repository import RoomRepository


class InMemoryRoomRepository(RoomRepository):
    """
    Simple in-memory repository for room storage.

    Suitable for local development and testing.
    """

    def __init__(self) -> None:
        self._rooms: Dict[str, dict] = {}

    def save_room(self, room_code: str, room_data: dict) -> None:
        """
        Save or update a room in memory.
        """
        self._rooms[room_code] = room_data

    def get_room(self, room_code: str) -> Optional[dict]:
        """
        Retrieve a room from memory.
        """
        return self._rooms.get(room_code)

    def delete_room(self, room_code: str) -> None:
        """
        Delete a room from memory.
        """
        self._rooms.pop(room_code, None)