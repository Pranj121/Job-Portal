// src/components/JobCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function JobCard({
  job,
  isSaved,
  onToggleSave,
  appliedCount,
  onDelete, // 🔥 optional (exists only for admin)
}) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        background: "white",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Job info */}
      <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
        {job.title}
      </h3>

      <p style={{ color: "#374151" }}>
        {job.company} — {job.location}
      </p>

      <p style={{ fontSize: "14px", color: "#6b7280" }}>
        Applications received: {appliedCount}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <button
          onClick={() => navigate(`/jobs/${job.id}`)}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            cursor: "pointer",
          }}
        >
          View Details
        </button>

        <button
          onClick={onToggleSave}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            background: isSaved ? "#9ca3af" : "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          {isSaved ? "Saved" : "Save Job"}
        </button>

        {/* 🔐 DELETE — ONLY IF ADMIN */}
        {onDelete && (
          <button
            onClick={onDelete}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              background: "#dc2626",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Delete Job
          </button>
        )}
      </div>
    </div>
  );
}
