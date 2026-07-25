import { useEffect, useState } from 'react'

import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState("checking...");

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    fetch(`${apiUrl}/health`)
      .then((response) => response.json())
      .then((data) => {
        setBackendStatus(data.status);
      })
      .catch(() => {
        setBackendStatus("backend not connected");
      });
  }, []);

  return (
    <>
      <main>
        <h1>English Speaking Platform</h1>
        <p>Frontend is running</p>
        <p>Backend status: {backendStatus}</p>
      </main>
    </>
  )
}

export default App
