// src/App.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client"; // ADDED: Import socket.io-client
import ChatWindow from "./components/ChatWindow/ChatWindow";
import SidePanel from "./components/SidePanel/SidePanel";
import "./App.css";

// ADDED: Create socket connection to the backend (port must match your backend, e.g., 5432)
const socket = io("http://localhost:5432");

function App() {
  // Initialize messages (you can start empty for production)
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [conversationGoal, setConversationGoal] = useState("");
  const [suggestions, setSuggestions] = useState([]); // ADDED: suggestions state

  // ADDED: Listen for 'new_message' and 'new_suggestions' events from the backend
  useEffect(() => {
    socket.on("new_message", (data) => {
      // Append new message from backend to our state
      setMessages((prev) => [...prev, data.message]);
    });
    socket.on("new_suggestions", (data) => {
      setSuggestions(data.suggestions);
    });
    return () => {
      socket.off("new_message");
      socket.off("new_suggestions");
    };
  }, []);

  // ADDED: When sending a message, emit it to the backend instead of simply updating local state
  const handleSendMessage = (newMessage) => {
    socket.emit("send_message", {
      conversation_id: "default",
      text: newMessage.text,
      goal: conversationGoal,
      flirtiness: 25,           // added flirtiness level
      humor: 25                      // added humor level
    });
    // Optionally, clear the draft message (we don't directly add the message here because
    // the backend will emit it back via 'new_message')
    setDraftMessage("");
  };

  // When a suggestion is clicked, update the draft text
  const handleSuggestionClick = (text) => {
    setDraftMessage(text);
  };

  return (
    <div className="app-container">
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        draftMessage={draftMessage}
        setDraftMessage={setDraftMessage}
      />
      <SidePanel
        onSuggestionClick={handleSuggestionClick}
        conversationGoal={conversationGoal}
        setConversationGoal={setConversationGoal}
        conversationHistory={messages}
        suggestions={suggestions} // ADDED: Pass suggestions to SidePanel
      />
    </div>
  );
}

export default App;
