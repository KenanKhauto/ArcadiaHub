from typing import Dict, List
from fastapi import WebSocket


class RoomConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_code: str, websocket: WebSocket):
        await websocket.accept()
        self.rooms.setdefault(room_code, []).append(websocket)

    def disconnect(self, room_code: str, websocket: WebSocket):
        if room_code in self.rooms:
            self.rooms[room_code].remove(websocket)

    async def broadcast(self, room_code: str, message: dict):
        for ws in self.rooms.get(room_code, []):
            await ws.send_json(message)


manager = RoomConnectionManager()