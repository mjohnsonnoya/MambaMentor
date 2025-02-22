import React, { useState } from "react";
import "./SidePanel.css";

import brightImg from "../../assets/bright.jpg";
import marcosImg from "../../assets/marcos.jpg";
import henroImg from "../../assets/henro.jpg";

// Define two sets of suggestions
const suggestionsSet1 = [
  "Hey, how about a quick break?",
  "Maybe we should get some coffee?",
  "Let's step away for a few minutes to recharge."
];

const suggestionsSet2 = [
  "Another fresh idea!",
  "Time to take a quick walk?",
  "Let’s go grab a snack!"
];

function SidePanel({ onSuggestionClick, conversationGoal, setConversationGoal }) {
  // Toggle which suggestion set is active
  const [useSetOne, setUseSetOne] = useState(true);
  const suggestions = useSetOne ? suggestionsSet1 : suggestionsSet2;

  // States for slider controls
  const [humor, setHumor] = useState(50);
  const [flirtiness, setFlirtiness] = useState(50);

  const handleSuggestionClick = (text) => {
    onSuggestionClick(text);
  };

  const handlePersonaClick = (personaName) => {
    console.log("Persona clicked:", personaName);
    // Future logic for persona-based suggestions can be added here.
  };

  // Toggle suggestion set on refresh
  const handleRefreshSuggestions = () => {
    setUseSetOne(!useSetOne);
  };

  return (
    <div className="side-panel">
      <h2>RizzBot</h2>

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
        {/* Suggestions Section with Header */}
        <div className="suggestions-header">
          <h3>Suggestions</h3>
          <button className="refresh-button" onClick={handleRefreshSuggestions}>
            ⟳
          </button>
        </div>
        <div className="suggestions-container">
          {suggestions.map((sugg, index) => (
            <button
              key={index}
              className="suggestion-button"
              onClick={() => handleSuggestionClick(sugg)}
            >
              {sugg}
            </button>
          ))}
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

      {/* New Section: Suggestion Settings */}
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
