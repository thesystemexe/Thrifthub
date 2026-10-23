import React from "react";
import "./statCard.css";

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">
        <Icon size={19} strokeWidth={1.8} />
      </div>

      <div className="stat-card-content">
        <p className="stat-card-title">{title}</p>

        <h2 className="stat-card-value">{value}</h2>
      </div>
    </div>
  );
};

export default StatCard;
