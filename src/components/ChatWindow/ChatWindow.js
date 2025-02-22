import React from "react";
import "./ChatWindow.css";

function ChatWindow({ messages, onSendMessage, draftMessage, setDraftMessage }) {
  
  const handleSend = () => {
    if (!draftMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "Me",
      text: draftMessage,
    };

    onSendMessage(newMessage);
    setDraftMessage("");
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="user-name">Annie</div>
          <div className="user-location">New York, NY</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble ${
              msg.sender === "Me" ? "my-bubble" : "their-bubble"
            }`}
          >
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message…"
          value={draftMessage}
          onChange={(e) => setDraftMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;
