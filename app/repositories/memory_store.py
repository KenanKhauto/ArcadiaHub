"""In-memory repository for rooms and running games."""

from typing import Dict, Optional


class MemoryStore:
    """
    Simple in-memory store.

    This is suitable for development only.
    For production, replace it with Redis or a database.
    """

    def __init__(self) -> None:
        self.rooms: Dict[str, dict] = {}

    def save_room(self, room_code: str, room_data: dict) -> None:
        """Save or update a room."""
        self.rooms[room_code] = room_data

    def get_room(self, room_code: str) -> Optional[dict]:
        """Get a room by code."""
        return self.rooms.get(room_code)

    def delete_room(self, room_code: str) -> None:
        """Delete a room by code."""
        self.rooms.pop(room_code, None)


memory_store = MemoryStore()