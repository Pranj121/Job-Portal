import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ theme, setTheme, isAdmin, onLogout }) {
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav
      style={{
        padding: "16px 24px",
        background: theme === "dark" ? "#00081d" : "#f8f9fa",
        color: theme === "dark" ? "white" : "black",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #444",
      }}
    >
      {/* Left side */}
      <div style={{ display: "flex", gap: "20px", fontSize: "18px" }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <b>Job Portal</b>
        </Link>

        <Link to="/jobs" style={{ textDecoration: "none", color: "inherit" }}>
          Jobs
        </Link>

        <Link to="/saved-jobs" style={{ textDecoration: "none", color: "inherit" }}>
          Saved Jobs ⭐
        </Link>

        {/* Only admin can see Applications */}
        {isAdmin && (
          <Link
            to="/applications"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Applications
          </Link>
        )}

        {/* Only admin can post a job */}
        {isAdmin && (
          <Link
            to="/post-job"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Post a Job
          </Link>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid gray",
            background: theme === "dark" ? "#222" : "white",
            color: theme === "dark" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        {/* Admin Login / Logout Button */}
        {!isAdmin ? (
          <button
            onClick={() => navigate("/admin-login")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              background: "#2563eb",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Admin Login
          </button>
        ) : (
          <button
            onClick={() => {
              onLogout();
              navigate("/");
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              background: "#ef4444",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

