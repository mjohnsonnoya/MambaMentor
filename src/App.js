import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import SidePanel from "./components/SidePanel/SidePanel";
import "./App.css";

function App() {
  // Keep your initial messages
  const [messages, setMessages] = useState([
    { id: 1, sender: "Annie", text: "How's your project going?" },
    { id: 2, sender: "Me", text: "Honestly kinda stuck rn..." },
  ]);

  // This will hold the draft message that goes into the ChatWindow's input
  const [draftMessage, setDraftMessage] = useState("");

  // If you want to store the conversation goal in the parent,
  // you can also add this. Otherwise, you can store it in SidePanel alone.
  const [conversationGoal, setConversationGoal] = useState("");

  // Function to handle sending a new message
  const handleSendMessage = (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  // Function to handle when a suggestion is clicked in SidePanel
  const handleSuggestionClick = (text) => {
    setDraftMessage(text);
  };

  return (
    <div className="app-container">
      {/* Left side: Chat window */}
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        draftMessage={draftMessage}
        setDraftMessage={setDraftMessage}
      />

      {/* Right side: Rizz analysis / side panel */}
      <SidePanel
        onSuggestionClick={handleSuggestionClick}
        conversationGoal={conversationGoal}
        setConversationGoal={setConversationGoal}
        conversationHistory={messages}
      />
    </div>
  );
}

export default App;
