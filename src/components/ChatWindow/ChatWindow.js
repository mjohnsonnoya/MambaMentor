import React from "react";
import "./ChatWindow.css";
import micIcon from '../../assets/microphone-solid.svg';


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
  const handleDictation = () => {
    alert("Start dictation… (this is a placeholder)"); // Replace with actual logic
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="user-name">John Pork</div>
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
        <button onClick={handleDictation} className="dictation-button">
          <img src={micIcon} alt="Mic" className="dictation-icon" />
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
