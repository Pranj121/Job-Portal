// src/components/JobCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function JobCard({ job }) {
  const navigate = useNavigate();

  const handleSave = () => {
    const existing = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    if (!existing.includes(job.id)) {
      localStorage.setItem(
        "savedJobs",
        JSON.stringify([...existing, job.id])
      );
    }
    alert("Job saved!");
  };

  return (
    <div /* your outer card styles */>
      {/* basic info shown on Jobs page */}
      <h3>{job.title}</h3>
      <p>{job.company} — {job.location}</p>

      <button onClick={() => navigate(`/jobs/${job.id}`)}>
        View details
      </button>

      <button onClick={handleSave}>Save job</button>
    </div>
  );
}
