import { useRef, useState } from 'react'

import './App.css'

const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const wsUrl = apiUrl.replace(/^http/, "ws");

function App() {
  const [roomCode, setRoomCode] = useState("TEST");
  const [status, setStatus] = useState("not connected");
  const [messages, setMessages] = useState([]);

  const socketRef = useRef(null);

  function connectWebSocket() {
    const socket = new WebSocket(`${wsUrl}/ws/${roomCode}`);

    socket.onopen = () => {
      setStatus("connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((currentMessages) => [...currentMessages, data]);
    };

    socket.onclose = () => {
      setStatus("disconnected");
    };

    socket.onerror = () => {
      setStatus("error");
    };

    socketRef.current = socket;
  }

  function sendTestMessage() {
    if (!socketRef.current) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "test_message",
        text: "Hello from frontend",
        created_at: new Date().toISOString(),
      })
    )
  }



  return (
    <>
      <main>
        <h1>English Speaking Platform</h1>
        <p>WebSocket status: {status}</p>
        
        <input
          value={roomCode}
          onChange={(event) => setRoomCode(event.target.value)}
          placeholder="Room code"
        />

        <button onClick={connectWebSocket}>Connect</button>
        <button onClick={sendTestMessage}>Send Test Message</button>

        <h2>Messages</h2>

        <ul>
          {messages.map((message, index) => (
            <li key={index}>{JSON.stringify(message)}</li>
          ))}
        </ul>
      </main>
    </>
  )
}

export default App
