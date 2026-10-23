import React from "react";
import "../styles/loader.css";

const Loader = ({ size = 40 }) => {
  return (
    <div
      className="loader-container"
      style={{
        "--loader-size": `${size}px`,
        "--loader-border": `${Math.max(2, size / 10)}px`,
      }}
    >
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
