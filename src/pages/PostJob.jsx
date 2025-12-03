// src/pages/PostJob.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PostJob() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState(""); // e.g. Full-time
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
      {
        title,
        company,
        location,
        type,
        description,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error posting job:", error.message);
      alert("Failed to post job. Check console.");
    } else {
      alert("Job posted successfully!");
      // clear form
      setTitle("");
      setCompany("");
      setLocation("");
      setType("");
      setDescription("");
      // go to jobs list
      navigate("/jobs");
    }
  };

  return (
    <main
      style={{
        padding: "24px",
        maxWidth: "600px",
        margin: "0 auto",
        color: "white",
      }}
    >
      <h1 className="text-2xl font-semibold mb-4">Post a Job</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <input
          placeholder="Job title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          placeholder="Job type (e.g. Full-time)"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <textarea
          placeholder="Job description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "8px",
            padding: "8px 16px",
            borderRadius: "20px",
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </main>
  );
}
