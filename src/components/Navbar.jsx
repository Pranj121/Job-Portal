import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ isAdmin, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        padding: "16px 24px",
        background: "#f8f9fa", // fixed light theme
        color: "black",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #e5e7eb",
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

        <Link
          to="/saved-jobs"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          Saved Jobs
        </Link>

        {/* Admin-only links */}
        {isAdmin && (
          <Link
            to="/applications"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Applications
          </Link>
        )}

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

