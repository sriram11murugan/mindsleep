import React from "react";

function Dashboard() {
  return (
    <div className="container">
      <h1>Sleep Dashboard</h1>

      <div className="cards">
        <div className="card">
          <h3>Sleep Duration</h3>
          <p>7h 20m</p>
        </div>

        <div className="card">
          <h3>Sleep Quality</h3>
          <p>Good</p>
        </div>

        <div className="card">
          <h3>Sleep Score</h3>
          <p>82 / 100</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;