from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import random
import string

app = FastAPI()

rooms = {}
connections = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://english-platform-six.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/rooms")
def create_room():
    code = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))

    rooms[code] = {
        "code": code
    }

    return {"code": code}

@app.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    await websocket.accept()

    if room_code not in connections:
        connections[room_code] = []

    connections[room_code].append(websocket)

    try:
        while True:
            data = await websocket.receive_json()

            for connection in connections[room_code]:
                await connection.send_json(data)

    except WebSocketDisconnect:
        connections[room_code].remove(websocket)
