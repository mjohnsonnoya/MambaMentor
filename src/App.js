import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import SidePanel from "./components/SidePanel/SidePanel";
import "./App.css";

function App() {
  // Just a placeholder for messages, or you might fetch from a server
  const [messages, setMessages] = useState([
    { id: 1, sender: "Annie", text: "How's your project going?" },
    { id: 2, sender: "Me", text: "Honestly kinda stuck rn..." },
  ]);

  // Example: to handle sending new messages
  const handleSendMessage = (newMessage) => {
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="app-container">
      {/* Left side: Chat window */}
      <ChatWindow messages={messages} onSendMessage={handleSendMessage} />
      
      {/* Right side: Rizz analysis / side panel */}
      <SidePanel />
    </div>
  );
}

export default App;
