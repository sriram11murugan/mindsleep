import React from "react";

function Result() {
  return (
    <div className="container">
      <h1>Mental Health Result</h1>

      <div className="result normal">
        <h2>Status: Normal</h2>
        <p>
          Based on your sleep data, no strong depression indicators were found.
        </p>
      </div>

      <p className="note">
        ⚠ This is not a medical diagnosis. Consult a professional if needed.
      </p>
    </div>
  );
}
<div className="result normal">
  <h2>🟢 Status: Normal</h2>
  <p>Your sleep patterns do not show strong depression indicators.</p>
</div>

export default Result;