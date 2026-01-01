// src/pages/ApplyJob.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resume, setResume] = useState("");
  const [intro, setIntro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !resume.trim() || !intro.trim()) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    /* 🔒 Prevent duplicate application */
    const { data: existing, error: checkError } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", id)
      .eq("email", email.trim());

    if (checkError) {
      console.error(checkError);
      setLoading(false);
      alert("Error checking existing application");
      return;
    }

    if (existing && existing.length > 0) {
      setLoading(false);
      alert("You have already applied for this job.");
      return;
    }

    /* ✅ Insert application */
    const { error } = await supabase.from("applications").insert([
      {
        job_id: id,
        name: name.trim(),
        email: email.trim(),
        resume_url: resume.trim(),
        intro: intro.trim(),
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Application error:", error.message);
      alert("Failed to submit application");
      return;
    }

    alert("Application submitted successfully");

    /* 🔁 Force Jobs page to refresh counts */
    navigate("/jobs", {
      state: { refresh: true },
    });
  };

  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 600,
            marginBottom: "16px",
            color: "#111827",
          }}
        >
          Apply for this Job
        </h1>

        <input
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="url"
          placeholder="Resume link (Google Drive, etc.)"
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Short introduction about yourself"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "12px",
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: loading ? "#9ca3af" : "#16a34a",
            color: "#ffffff",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit application"}
        </button>
      </form>
    </main>
  );
}

/* -------- INPUT STYLE -------- */
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#111827",
  fontSize: "14px",
};
