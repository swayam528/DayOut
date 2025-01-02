import React from "react";
import "./DayOutForm"; // Styling for individual activity

const Activity = ({ activity }) => {
  return (
    <div className="activity-card">
      <h3 style={{ color: "black" }}>{activity.name}</h3>
      <p style={{ color: "black" }}>{activity.description}</p>
      <p style={{ color: "black" }}>Duration: {activity.length}</p>
      {/* Placeholder for image */}
      <div className="activity-image-placeholder">[Image]</div>
    </div>
  );
};

export default Activity;
