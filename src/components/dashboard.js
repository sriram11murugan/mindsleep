import React from "react";
import { Moon, Activity, HeartPulse } from "lucide-react";

function Dashboard() {
  return (
    <div className="container">
      <h1>Sleep Overview</h1>

      <div className="cards">
        <div className="glass">
          <Moon size={30} />
          <h3>Sleep Duration</h3>
          <h2>7h 20m</h2>
        </div>

        <div className="glass">
          <HeartPulse size={30} />
          <h3>Sleep Quality</h3>
          <h2>Good</h2>
        </div>

        <div className="glass">
          <Activity size={30} />
          <h3>Sleep Score</h3>
          <h2>82</h2>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;