import { useRef, useState, useEffect } from 'react'

import './App.css'

const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const wsUrl = apiUrl.replace(/^http/, "ws");

function App() {
  const path = window.location.pathname;
  const parts = path.split("/").filter(Boolean)

  const isTeacher = parts[0] == "t";
  const roomFromUrl = isTeacher ? parts[1] : parts[0];
  const isHome = parts.length === 0;

  const [roomCode, setRoomCode] = useState(roomFromUrl || "TEST");
  const [status, setStatus] = useState("not connected");
  const [spinResult, setSpinResult] = useState(null);

  const socketRef = useRef(null);

  const studentLink = `${window.location.origin}/${roomCode}`



  function connectWebSocket() {
    if(socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(`${wsUrl}/ws/${roomCode}`);

    socket.onopen = () => {
      setStatus("connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "spin_result") {
        setSpinResult(data);
      }
    };

    socket.onclose = () => {
      setStatus("disconnected");
    };

    socket.onerror = () => {
      setStatus("error");
    };

    socketRef.current = socket;
  }

  function spin() {
    if (!socketRef.current) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        action: "spin",
      })
    )
  }

  async function createRoom() {
    const response = await fetch(`${apiUrl}/rooms`, {
      method: "POST",
    });

    const data = await response.json();

    window.location.href = `/t/${data.code}`;
  }

  useEffect(() => {
    if (isHome) {
      return;
    }

    connectWebSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    }
  }, [])

  if(isHome) {
    return (
      <main>
        <h1>English Speaking Platform</h1>
        <button onClick={createRoom}>Create room</button>
      </main>
    )
  }

  return (
    <>
      <main>
        <h1>English Speaking Platform</h1>
        <p>WebSocket status: {status}</p>

        <h2>{isTeacher ? "Teacher screen" : "Student screen"}</h2>

        {isTeacher && (
          <div>
              <p>
              Student link: {" "}
              <a href={studentLink} target='_blank' rel="noreferrer">
                {studentLink}
              </a>
            </p>
            <button onClick={() => navigator.clipboard.writeText(studentLink)}>
              Copy link
            </button>
          </div>
          
        )}
        
        <input
          value={roomCode}
          onChange={(event) => setRoomCode(event.target.value)}
          placeholder="Room code"
          readOnly={Boolean(roomFromUrl)}
        />


        <button onClick={connectWebSocket}>Reconnect</button>
        {isTeacher && <button onClick={spin}>Spin</button>}

        <h2>Messages</h2>

        {spinResult && (
          <section>
            <h2>{spinResult.title} {spinResult.level}</h2>

            <p><strong>WHO:</strong> {spinResult.who}</p>
            <p><strong>WHERE:</strong> {spinResult.where}</p>
            <p><strong>PROBLEM:</strong>{spinResult.problem}</p>
            <p><strong>TARGET LANGUAGE:</strong> {spinResult.target_language}</p>
          </section>
        )}
      </main>
    </>
  )
}

export default App
