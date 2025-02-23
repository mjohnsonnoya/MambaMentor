// src/components/ChatWindow/ChatWindow.js
import React from "react";
import "./ChatWindow.css";
import micIcon from "../../assets/microphone-solid.svg";

function ChatWindow({ messages, onSendMessage, draftMessage, setDraftMessage }) {
  const handleSend = () => {
    if (!draftMessage.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: "Me", // This is the user message.
      text: draftMessage,
    };
    console.log("Sending user message:", newMessage);
    onSendMessage(newMessage);
    setDraftMessage("");
  };

  const handleDictation = () => {
    alert("Start dictation… (this is a placeholder)");
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="user-name">Margot Robbie</div>
          <div className="user-location">Los Angeles, CA</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => {
          // CHANGED: Use "my-bubble" for user messages, "their-bubble" for AI (Other) messages.
          const bubbleClass = msg.sender === "Me" ? "my-bubble" : "their-bubble";
          return (
            <div key={msg.id} className={`chat-bubble ${bubbleClass}`}>
              {/* <p style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{msg.text}</p> */}
              <p style={{ lineHeight: "1.2", whiteSpace: "pre-line" }}>
              {msg.text}
              </p>
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message…"
          value={draftMessage}
          onChange={(e) => setDraftMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleDictation} className="dictation-button">
          <img src={micIcon} alt="Mic" className="dictation-icon" />
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
