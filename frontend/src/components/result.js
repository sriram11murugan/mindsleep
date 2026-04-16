import React, { useEffect, useState } from "react";

function Result() {

  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("result"));
    if (stored) {
      setResult(stored);
    }
  }, []);

  if (!result) {
    return (
      <div className="container">
        <p>⚠ No result available</p>
        <p>👉 Please complete a sleep session first</p>
      </div>
    );
  }

  const isRisk = result.final_prediction === "Depression Risk";

  return (
    <div className="container">

      <div className={isRisk ? "result risk" : "result normal"}>

        <h2>
          {isRisk ? "🔴 Depression Risk" : "🟢 Normal"}
        </h2>

        <p>
          {isRisk
            ? "Your sleep pattern indicates possible risk."
            : "Your sleep pattern looks good."}
        </p>

      </div>

      <p className="note">
        ⚠ This is not a medical diagnosis.
      </p>

    </div>
  );
}

export default Result;
