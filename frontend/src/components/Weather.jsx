import React, { useState, useEffect } from "react";

const Weather = () => {
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/weather")
      .then(res => res.json())
      .then(data => setTemp(data.temp))
      .catch(err => console.error("Frontend fetch failed:", err));
  }, []);

  if (temp === null) return <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>☁️ Updating...</div>;

  return (
    <div style={{
      background: "#1f2028",
      padding: "10px 20px",
      borderRadius: "12px",
      border: "1px solid #aa3bff",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: "white"
    }}>
      <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{temp}°F</span>
      <span style={{ color: "#9ca3af", fontSize: "0.7rem" }}>CSTX</span>
    </div>
  );
};

export default Weather;