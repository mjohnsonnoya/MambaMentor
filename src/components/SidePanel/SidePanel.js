import React, { useState, useEffect, useCallback, useRef } from "react";
import "./SidePanel.css";
import jackImg from "../../assets/jack.jpg";
import barackImg from "../../assets/barack.png";
import robertImg from "../../assets/robert.png";
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
  const [professional, setProfessional] = useState(50);
  const [wholesomeness, setWholesomeness] = useState(50);
  const [suggestionsArray, setSuggestionsArray] = useState([]);
  const [buffer, setBuffer] = useState("");
  const [personaTranscript, setpersonaTranscript] = useState("");
  const [selectedPersona, setSelectedPersona] = useState(null);
  
  const prevTextRef = useRef("");
  const requestIdRef = useRef(0);
  const initialRefreshDone = useRef(false);

  // When a suggestion is clicked, call the provided callback
  const handleSuggestionClick = (text) => {
    onSuggestionClick(text);
  };

  // Handle persona clicks to toggle selection.
  const handlePersonaClick = (personaName) => {
    console.log("Persona clicked:", personaName);
    // If the persona is already selected, deselect it.
    if (selectedPersona === personaName) {
      setSelectedPersona(null);
      setpersonaTranscript("");
    } else {
      // Otherwise, select the new persona.
      setSelectedPersona(personaName);
      if (personaName === "Jack Harlow") {
        fetch("/transcript.txt")
          .then(response => response.text())
          .then(text => {
            setpersonaTranscript(
              "Please response like you are Jack Harlow. Here is a sample of Jack Harlow's conversation with someone else for you to model off of:\n\n" +
                text +
                "\n\n"
            );
            console.log("Loaded Jack Harlow transcript:", text);
          })
          .catch(error => console.error("Error loading transcript:", error));
      } else if (personaName === "Barack Obama") {
        fetch("/transcript_obama.txt")
          .then(response => response.text())
          .then(text => {
            setpersonaTranscript(
              "Please response like you are Barack Obama. Here is a sample of Barack Obama's conversation with someone else for you to model off of:\n\n" +
                text +
                "\n\n"
            );
            console.log("Loaded Barack Obama transcript:", text);
          })
          .catch(error => console.error("Error loading transcript:", error));
      } else if (personaName === "Iron Man") {
        fetch("/transcript_robert.txt")
          .then(response => response.text())
          .then(text => {
            setpersonaTranscript(
              "Please response like you are Robert Downey Jr. Here is a sample of Robert Downey Jr.'s conversation with someone else for you to model off of (he is person A):\n\n" +
                text +
                "\n\n"
            );
            console.log("Loaded Robert Downey transcript:", text);
          })
          .catch(error => console.error("Error loading transcript:", error));
      } else {
        // If a different persona is selected, clear the transcript.
        setpersonaTranscript("");
        console.log("Cleared persona transcript.");
      }
    }
  };

  // Memoize the refresh handler so that its identity is stable.
  const handleRefreshSuggestions = useCallback(() => {
    requestIdRef.current++;
    const currentRequestId = requestIdRef.current;
    
    const safeHistory = conversationHistory || [];
    const formattedHistory = safeHistory
      .map((msg) => `${msg.sender}: ${msg.text}`)
      .join("\n");
    
    console.log("Refreshing suggestions with data:", {
      conversationHistory: formattedHistory,
      conversationGoal,
      personaTranscript,
      flirtiness,
      humor,
      professional,
      wholesomeness,
      requestId: currentRequestId,
    });
    
    socket.emit("request_suggestions", {
      conversation_id: "default",
      text: formattedHistory,
      goal: conversationGoal,
      personaTranscript,
      flirtiness,
      humor,
      professional,
      wholesomeness,
      requestId: currentRequestId
    });
  }, [conversationHistory, conversationGoal, flirtiness, humor, professional, wholesomeness, personaTranscript]);

  // Auto-refresh on conversation history change
  useEffect(() => {
    if (conversationHistory.length === 0 && !initialRefreshDone.current) {
      initialRefreshDone.current = true;
      console.log("Page initialized with no conversation history.");
      handleRefreshSuggestions();
    } else if (conversationHistory.length > 0) {
      handleRefreshSuggestions();
    }
  }, [conversationHistory, handleRefreshSuggestions]);

  // Auto-refresh when settings or personaTranscript change.
  useEffect(() => {
    handleRefreshSuggestions();
  }, [conversationGoal, flirtiness, humor, professional, wholesomeness, personaTranscript, handleRefreshSuggestions]);

  // Listen for new suggestions from the server.
  useEffect(() => {
    const handleNewSuggestions = (data) => {
      if (data.requestId !== requestIdRef.current || !data.suggestions) return;
  
      const newCumulativeText = data.suggestions;
      const prevText = prevTextRef.current;
      let delta = "";
  
      if (newCumulativeText.startsWith(prevText)) {
        delta = newCumulativeText.slice(prevText.length);
      } else {
        delta = newCumulativeText;
        setSuggestionsArray([]);
        setBuffer("");
      }
      prevTextRef.current = newCumulativeText;
  
      setBuffer((prevBuffer) => {
        const updatedBuffer = prevBuffer + delta;
        const parts = updatedBuffer.split("\n");
        const completeLines = parts.slice(0, -1)
          .map((line) => line.trim())
          .filter((line) => line !== "");
        const incomplete = parts[parts.length - 1];
  
        setSuggestionsArray((prevArray) => {
          const newUniqueLines = completeLines.filter(line => !prevArray.includes(line));
          return [...prevArray, ...newUniqueLines];
        });
        
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
      <h2>Mamba Mentor</h2>
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
          <button
            className={`persona-button ${selectedPersona === "Barack Obama" ? "selected-persona" : ""}`}
            onClick={() => handlePersonaClick("Barack Obama")}
          >
            <img src={barackImg} alt="Barack Obama" className="persona-image" />
            <div className="persona-name">Barack Obama</div>
          </button>
          <button
            className={`persona-button ${selectedPersona === "Jack Harlow" ? "selected-persona" : ""}`}
            onClick={() => handlePersonaClick("Jack Harlow")}
          >
            <img src={jackImg} alt="Jack Harlow" className="persona-image" />
            <div className="persona-name">Jack Harlow</div>
          </button>
          <button
            className={`persona-button ${selectedPersona === "Iron Man" ? "selected-persona" : ""}`}
            onClick={() => handlePersonaClick("Iron Man")}
          >
            <img src={robertImg} alt="Iron Man" className="persona-image" />
            <div className="persona-name">Iron Man</div>
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
        <div className="slider-container">
          <label>Professional: {professional}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={professional}
            onChange={(e) => setProfessional(e.target.value)}
          />
        </div>
        <div className="slider-container">
          <label>Wholesomeness: {wholesomeness}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={wholesomeness}
            onChange={(e) => setWholesomeness(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default SidePanel;
