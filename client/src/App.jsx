import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const socket = useRef(null);
  useEffect(() => {
    if (socket.current) {
      return;
    }
    socket.current = new WebSocket("ws://localhost:3001");
    socket.current.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "history") {
        console.log("History Received");
      }
    });
  }, []);
  return (
    <div className="pollingApp">
      <div className="container"></div>
    </div>
  );
}

export default App;
