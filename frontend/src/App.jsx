import { useEffect, useState } from 'react'

import './App.css'

function App() {
  
  const [backendStatus, setBackendStatus] = useState("cheking...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
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
        <h1>English Speaking PLatform</h1>
        <p>Frontend is running</p>
        <p>Bakend status: {backendStatus}</p>
      </main>
    </>
  )
}

export default App
