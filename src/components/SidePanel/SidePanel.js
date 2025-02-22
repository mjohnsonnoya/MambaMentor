import React from "react";
import "./SidePanel.css";

import brightImg from "../../assets/bright.jpg";
import marcosImg from "../../assets/marcos.jpg";
import henroImg from "../../assets/henro.jpg"

function SidePanel({
  onSuggestionClick,
  conversationGoal,
  setConversationGoal,
}) {
  // If you want to store the conversation goal only here, you could do:
  // const [conversationGoal, setConversationGoal] = useState("");

  // Example suggestions
  const suggestions = [
    "Hey, how about a quick break?",
    "Maybe we should get some coffee?",
    "Let's step away for a few minutes to recharge."
  ];

  const handleSuggestionClick = (text) => {
    onSuggestionClick(text);
  };

  const handlePersonaClick = (personaName) => {
    console.log("Persona clicked:", personaName);
    // In the future, you might want to update suggestions
    // or do something else based on persona.
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
        <h3>Suggestions</h3>
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
          <button
            className="persona-button"
            onClick={() => handlePersonaClick("Bright")}
          >
            <img
              src={brightImg}
              alt="Bright"
              className="persona-image"
            />
            <div className="persona-name">Bright</div>
          </button>

          <button
            className="persona-button"
            onClick={() => handlePersonaClick("Marcos")}
          >
            <img
              src={marcosImg}
              alt="Marcos"
              className="persona-image"
            />
            <div className="persona-name">Marcos</div>
          </button>

          <button
            className="persona-button"
            onClick={() => handlePersonaClick("Henry")}
          >
            <img
              src={henroImg}
              alt="Henry"
              className="persona-image"
            />
            <div className="persona-name">Henry</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SidePanel;
