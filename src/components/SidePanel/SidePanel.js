import React from "react";
import "./SidePanel.css";

function SidePanel() {
  return (
    <div className="side-panel">
      <h2>Social Stockfish v0.1</h2>
      <div className="analysis-section">
        <h3>Conversation Goal</h3>
        <p>Get Annie to playfully suggest coffee as a break from hackathon stress without directly asking.</p>
      </div>

      <div className="analysis-section">
        <h3>Analysis</h3>
        <p>Confidence Score: 0.82</p>
        <p>Could definitely use those recs right about now…</p>
      </div>

      <div className="analysis-section">
        <h3>Conversation State Exploration</h3>
        <p>...some state diagram or fancy D3 chart goes here...</p>
      </div>

      <div className="analysis-section">
        <h3>Monte Carlo Evaluation</h3>
        <p>...the probability of success is 73.4%...</p>
      </div>
    </div>
  );
}

export default SidePanel;
