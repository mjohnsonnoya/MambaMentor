import React, { useState, useEffect, useCallback, useRef } from "react";
import "./SidePanel.css";
import brightImg from "../../assets/bright.jpg";
import marcosImg from "../../assets/marcos.jpg";
import henroImg from "../../assets/henro.jpg";
import { socket } from "../../socket"; // your Socket.IO client instance

function SidePanel({
  onSuggestionClick,
  conversationGoal,
  setConversationGoal,
  conversationHistory // passed from parent
}) {
  // State to store suggestions from the backend
  const [serverSuggestions, setServerSuggestions] = useState([]);
  const [humor, setHumor] = useState(50);
  const [flirtiness, setFlirtiness] = useState(50);

  // Create a ref to store the current request id
  const requestIdRef = useRef(0);
  const initialRefreshDone = useRef(false);

  // When a suggestion is clicked, call the provided callback
  const handleSuggestionClick = (text) => {
    onSuggestionClick(text);
  };

  const handlePersonaClick = (personaName) => {
    console.log("Persona clicked:", personaName);
    // Future logic for persona-based suggestions can be added here.
  };
  
  // Memoize the refresh handler so that its identity is stable
  const handleRefreshSuggestions = useCallback(() => {
    setServerSuggestions([]);

    // Increment the request id
    requestIdRef.current++;
    const currentRequestId = requestIdRef.current;
    
    const safeHistory = conversationHistory || [];
    const formattedHistory = safeHistory
      .map((msg) => `${msg.sender}: ${msg.text}`)
      .join("\n");

    console.log("Refreshing suggestions with data:", {
      conversationHistory: formattedHistory,
      conversationGoal,
      flirtiness,
      humor,
      currentRequestId
    });

    socket.emit("request_suggestions", {
      conversation_id: "default",
      text: formattedHistory,
      goal: conversationGoal,
      flirtiness,
      humor,
      requestId: currentRequestId
    });
  }, [conversationHistory, conversationGoal, flirtiness, humor]);

  useEffect(() => {
    // If conversationHistory is empty and we haven't done the initial refresh:
    if (conversationHistory.length === 0 && !initialRefreshDone.current) {
      initialRefreshDone.current = true;
      console.log("Page initialized with no conversation history.");
      handleRefreshSuggestions();
    }
    // For subsequent changes (when there is at least one message), always refresh:
    else if (conversationHistory.length > 0) {
      handleRefreshSuggestions();
    }
  }, [conversationHistory, handleRefreshSuggestions]);

  // Listen for new suggestions from the server
  useEffect(() => {
    const handleNewSuggestions = (data) => {
      // Only update if the response's requestId matches the latest one.
      if (data.requestId === requestIdRef.current && data.suggestions) {
        console.log("Received valid suggestions from server:", data.suggestions);
        const suggestionsArray = data.suggestions
          .split("\n")
          .filter((s) => s.trim() !== "");
        setServerSuggestions(suggestionsArray);
      } else {
        console.log("Discarding outdated suggestions");
      }
    };

    socket.on("new_suggestions", handleNewSuggestions);
    return () => {
      socket.off("new_suggestions", handleNewSuggestions);
    };
  }, []);

  return (
    <div className="side-panel">
      <h2>The Rizzler</h2>
      <div className="analysis-section">
        <h3>Conversation Goal</h3>
        <input
          className="goal-input"
          type="text"
          placeholder="Enter your conversation goal..."
          value={conversationGoal}
          onChange={(e) => setConversationGoal(e.target.value)}
        />
      </div>

      <div className="analysis-section">
        <div className="suggestions-header">
          <h3>Suggestions</h3>
          <button className="refresh-button" onClick={handleRefreshSuggestions}>
            ⟳
          </button>
        </div>
        <div className="suggestions-container">
          {serverSuggestions.length > 0 ? (
            serverSuggestions.map((sugg, index) => (
              <button
                key={index}
                className="suggestion-button"
                onClick={() => handleSuggestionClick(sugg)}
              >
                {sugg}
              </button>
            ))
          ) : (
            <p style={{ visibility: "hidden" }}>No suggestions yet.</p>
          )}
        </div>
      </div>

      <div className="analysis-section">
        <h3>Personas</h3>
        <div className="personas-container">
          <button className="persona-button" onClick={() => handlePersonaClick("Bright")}>
            <img src={brightImg} alt="Bright" className="persona-image" />
            <div className="persona-name">Bright</div>
          </button>
          <button className="persona-button" onClick={() => handlePersonaClick("Marcos")}>
            <img src={marcosImg} alt="Marcos" className="persona-image" />
            <div className="persona-name">Marcos</div>
          </button>
          <button className="persona-button" onClick={() => handlePersonaClick("Henry")}>
            <img src={henroImg} alt="Henry" className="persona-image" />
            <div className="persona-name">Henry</div>
          </button>
        </div>
      </div>

      <div className="analysis-section">
        <h3>Settings</h3>
        <div className="slider-container">
          <label>Flirtiness: {flirtiness}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={flirtiness}
            onChange={(e) => setFlirtiness(e.target.value)}
          />
        </div>
        <div className="slider-container">
          <label>Humor: {humor}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={humor}
            onChange={(e) => setHumor(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default SidePanel;
