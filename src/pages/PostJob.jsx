// src/pages/PostJob.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PostJob() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !company || !location || !type || !description) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("jobs").insert([
      { title, company, location, type, description }
    ]);

    setLoading(false);

    if (error) {
      alert("Failed to post job");
      console.error(error);
    } else {
      alert("Job posted successfully");
      navigate("/jobs");
    }
  };

  return (
    <main
      style={{
        padding: "32px",
        maxWidth: "600px",
        margin: "40px auto",
        background: "white",
        color: "#111827",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px" }}>
        Post a Job
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <input
          placeholder="Job title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Job type (Full-time / Remote)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={inputStyle}
        />
        <textarea
          placeholder="Job description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "12px",
            padding: "10px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </main>
  );
}

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  color: "#111827",
  background: "white",
};
