from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import random
import string

app = FastAPI()

rooms = {}
connections = {}

scenario = {
    "title": "Hotel problem",
    "level": "A2",
    "who": [
        "angry guest",
        "tired receptionist",
        "hotel manager",
        "tourist with limited English",
        "receptionist on their first day",
    ],
    "where": [
        "hotel reception",
        "small hotel room",
        "hotel lobby",
        "booking desk",
        "breakfast area",
    ],
    "problem": [
        "the room is dirty",
        "the key card does not work",
        "there is no hot water",
        "the booking is missing",
        "the room is too noisy",
    ],
    "target_language": [
        "I'd like to...",
        "Could you please...?",
        "There seems to be a problem with...",
        "I booked...",
        "Is it possible to...?",
    ],
}

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

            if data.get("action") == "spin":
                message = {
                    "type": "spin_result",
                    "title": scenario["title"],
                    "level": scenario["level"],
                    "who": random.choice(scenario["who"]),
                    "where": random.choice(scenario["where"]),
                    "problem": random.choice(scenario["problem"]),
                    "target_language": random.choice(scenario["target_language"]),
                }
            else:
                message = data

            for connection in connections[room_code]:
                await connection.send_json(message)

    except WebSocketDisconnect:
        connections[room_code].remove(websocket)
