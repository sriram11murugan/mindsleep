import React, { useState, useEffect, useRef, useCallback } from "react";
import { runPrediction } from "../services/predictionService";

function Dashboard() {

  const [running, setRunning] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [time, setTime] = useState(0);

  const [heartRate, setHeartRate] = useState("--");
  const [spo2, setSpo2] = useState("--");
  const [sleepScore, setSleepScore] = useState("--");

  const [battery, setBattery] = useState(100);
  const [sessionData, setSessionData] = useState([]);

  const deviceRef = useRef(null);
  const charRef = useRef(null);

  // =========================
  // CLEAR OLD SESSION
  // =========================
  useEffect(() => {
    localStorage.removeItem("liveSession");
  }, []);

  // =========================
  // 😴 Sleep Quality
  // =========================
  function getSleepLevel(hours) {
    if (hours < 4) return "Poor";
    if (hours < 6) return "Average";
    return "Good";
  }

  // =========================
  // 🧠 Sleep Score
  // =========================
  function calculateSleepScore(hr, spo2, movement, sleep_hours) {
    let score = 100;

    if (sleep_hours < 5) score -= 25;
    else if (sleep_hours < 6) score -= 15;

    if (hr > 85) score -= 15;
    else if (hr > 75) score -= 5;

    if (spo2 < 94) score -= 20;
    else if (spo2 < 96) score -= 10;

    if (movement > 40) score -= 20;
    else if (movement > 25) score -= 10;

    return Math.max(score, 0);
  }

  // =========================
  // 🛑 STOP FUNCTION (FIXED)
  // =========================
  const handleStop = useCallback(async () => {
    setRunning(false);

    if (sessionData.length === 0) return;

    const avg = key =>
      sessionData.reduce((a, b) => a + b[key], 0) / sessionData.length;

    const finalData = {
      sleep_hours: time / 3600,
      heart_rate: avg("heart_rate"),
      spo2: avg("spo2"),
      movement: avg("movement"),
      sleep_score: avg("sleep_score")
    };

    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.push({
      date: new Date().toLocaleDateString(),
      ...finalData
    });
    localStorage.setItem("history", JSON.stringify(history));

    localStorage.setItem("lastSession", JSON.stringify(sessionData));
    localStorage.removeItem("liveSession");

    try {
      const result = await runPrediction(finalData);
      localStorage.setItem("result", JSON.stringify(result));
      alert("✅ Prediction Done");
    } catch {
      alert("❌ Server Error");
    }

  }, [sessionData, time]);

  // =========================
  // 🔵 BLUETOOTH CONNECT
  // =========================
  const connectBluetooth = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["12345678-1234-1234-1234-1234567890ab"]
      });

      const server = await device.gatt.connect();
      deviceRef.current = device;

      const service = await server.getPrimaryService(
        "12345678-1234-1234-1234-1234567890ab"
      );

      const characteristic = await service.getCharacteristic(
        "abcd1234-5678-1234-5678-1234567890ab"
      );

      charRef.current = characteristic;

      await characteristic.startNotifications();

      setDeviceConnected(true);

      device.addEventListener("gattserverdisconnected", () => {
        setDeviceConnected(false);
        setRunning(false);
        alert("❌ Device Disconnected");
      });

      characteristic.addEventListener("characteristicvaluechanged", (event) => {

        const value = new TextDecoder().decode(event.target.value);

        if (value.includes("ALERT")) {
          alert("🚨 Finger Removed!");
          setRunning(false);
          return;
        }

        const parts = value.split(",");
        if (parts.length < 3) return;

        const hr = Number(parts[0]);
        const sp = Number(parts[1]);
        const move = Number(parts[2]);

        const score = calculateSleepScore(
          hr,
          sp,
          move,
          time / 3600
        );

        setHeartRate(hr);
        setSpo2(sp);
        setSleepScore(score);

        setSessionData(prev => {
          const updated = [
            ...prev,
            {
              heart_rate: hr,
              spo2: sp,
              movement: move,
              sleep_score: score,
              time: Date.now()
            }
          ];

          localStorage.setItem("liveSession", JSON.stringify(updated));
          return updated;
        });

      });

      return true;

    } catch (err) {
      console.log("Bluetooth Error:", err);
      setDeviceConnected(false);
      return false;
    }
  };

  // =========================
  // ▶ START
  // =========================
  const handleStart = async () => {
    const success = await connectBluetooth();

    if (!success) {
      alert("❌ Bluetooth not connected");
      return;
    }

    setRunning(true);
    setSessionData([]);
    setTime(0);
  };

  // =========================
  // ⏱ TIMER (FIXED)
  // =========================
  useEffect(() => {
    let interval;

    if (running) {
      interval = setInterval(() => {

        setTime(prev => {
          const newTime = prev + 1;

          if (newTime >= 300) {
            handleStop();
          }

          return newTime;
        });

        setBattery(prev => (prev > 0 ? prev - 0.02 : 0));

      }, 1000);
    }

    return () => clearInterval(interval);

  }, [running, handleStop]); // ✅ FIXED

  // =========================
  // ⏱ FORMAT TIME
  // =========================
  const formatTime = () => {
    const h = String(Math.floor(time / 3600)).padStart(2, "0");
    const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
    const s = String(time % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="container">

      <div className="top-bar">
        <div className={deviceConnected ? "device on" : "device off"}>
          {deviceConnected ? "🟢 Device Connected" : "🔴 Device Not Connected"}
        </div>

        <div className="battery">
          🔋 {Math.floor(battery)}%
        </div>
      </div>

      <h1>MindSleep Dashboard</h1>

      <div className="buttons">
        <button className="start" onClick={handleStart}>
          Start Sleep
        </button>

        <button className="stop" onClick={handleStop}>
          End Sleep
        </button>
      </div>

      <p>Status: {running ? "Running" : "Idle"}</p>
      <h3>{formatTime()}</h3>

      <div className="cards">

        <div className="card">
          <h4>Sleep Duration</h4>
          <p>{formatTime()}</p>
        </div>

        <div className="card">
          <h4>Sleep Quality</h4>
          <p>{running ? getSleepLevel(time / 3600) : "--"}</p>
        </div>

        <div className="card">
          <h4>Sleep Score</h4>
          <p>{sleepScore}</p>
        </div>

        <div className="card">
          <h4>Heart Rate</h4>
          <p>{heartRate}</p>
        </div>

        <div className="card">
          <h4>SpO₂</h4>
          <p>{spo2}</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
