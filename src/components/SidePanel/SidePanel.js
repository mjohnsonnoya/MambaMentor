import React, { useState, useEffect, useCallback, useRef } from "react";
import "./SidePanel.css";
import brightImg from "../../assets/bright.jpg";
import marcosImg from "../../assets/marcos.jpg";
import henroImg from "../../assets/henro.jpg";
import jackImg from "../../assets/jack.jpg"
import { socket } from "../../socket"; // your Socket.IO client instance


function SidePanel({
  onSuggestionClick,
  conversationGoal,
  setConversationGoal,
  conversationHistory // passed from parent
}) {
  // State to store suggestions from the backend
  const [humor, setHumor] = useState(50);
  const [flirtiness, setFlirtiness] = useState(50);
  const [suggestionsArray, setSuggestionsArray] = useState([]);
  const [buffer, setBuffer] = useState("");
  const prevTextRef = useRef("");

  // Create a ref to store the current request id
  const requestIdRef = useRef(0);
  const initialRefreshDone = useRef(false);

  // When a suggestion is clicked, call the provided callback
  const handleSuggestionClick = (text) => {
    onSuggestionClick(text);
  };

  const handlePersonaClick = (personaName) => {
    console.log("Persona clicked:", personaName);
    // If Jack Harlow is selected, fetch the transcript
    if (personaName === "Jack Harlow") {
      fetch("/transcript.txt")
        .then(response => response.text())
        .then(text => {
          setPersonaTranscript(text);
          console.log("Loaded Jack Harlow transcript:", text);
        })
        .catch(error => console.error("Error loading transcript:", error));
    } else {
      // For other personas, you might clear or set a different transcript
      setPersonaTranscript("");
    }
  };
  
  
  
  // Memoize the refresh handler so that its identity is stable
  const handleRefreshSuggestions = useCallback(() => {
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
      if (data.requestId !== requestIdRef.current || !data.suggestions) return;
  
      // data.suggestions is the cumulative text.
      const newCumulativeText = data.suggestions;
      const prevText = prevTextRef.current;
      let delta = "";
  
      if (newCumulativeText.startsWith(prevText)) {
        // Extract only the newly appended text.
        delta = newCumulativeText.slice(prevText.length);
      } else {
        // If something goes awry, reset.
        delta = newCumulativeText;
        setSuggestionsArray([]);
        setBuffer("");
      }
      // Update the reference to the full cumulative text.
      prevTextRef.current = newCumulativeText;
  
      // Update the buffer and process complete lines.
      setBuffer((prevBuffer) => {
        const updatedBuffer = prevBuffer + delta;
        // Split the updated buffer on newline.
        const parts = updatedBuffer.split("\n");
        // All parts except the last are complete suggestions.
        const completeLines = parts.slice(0, -1)
          .map((line) => line.trim())
          .filter((line) => line !== "");
        const incomplete = parts[parts.length - 1];
  
        // Append only new complete lines that are not already in suggestionsArray.
        setSuggestionsArray((prevArray) => {
          const newUniqueLines = completeLines.filter(line => !prevArray.includes(line));
          return [...prevArray, ...newUniqueLines];
        });
        
        // Return the incomplete part as the new buffer.
        return incomplete;
      });
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
          {suggestionsArray.map((sugg, index) => (
            <button
              key={index}
              className="suggestion-button"
              onClick={() => handleSuggestionClick(sugg)}
            >
              {sugg}
            </button>
          ))}
          {buffer && (
            <button
              className="suggestion-button"
              onClick={() => handleSuggestionClick(buffer)}
            >
              {buffer}
            </button>
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
          <button className="persona-button" onClick={() => handlePersonaClick("Jack Harlow")}>
            <img src={jackImg} alt="Jack Harlow" className="persona-image" />
            <div className="persona-name">Jack</div>
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
