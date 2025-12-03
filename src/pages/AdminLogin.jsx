// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const ok = onLogin(password);

    if (ok) {
      // Success → go to Post Job page
      navigate("/post-job");
    } else {
      setError("Incorrect admin password.");
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
      <p style={{ marginBottom: "12px" }}>
        Enter admin password to post a job.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "320px" }}
      >
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px" }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            borderRadius: "9999px",
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          Login
        </button>

        {error && (
          <p style={{ color: "red", marginTop: "4px" }}>{error}</p>
        )}
      </form>
    </section>
  );
}

export default AdminLogin;

