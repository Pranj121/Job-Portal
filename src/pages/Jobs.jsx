// src/pages/Jobs.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import JobCard from "../components/JobCard";

export default function Jobs() {
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [appliedCounts, setAppliedCounts] = useState({});
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [titleQuery, setTitleQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  // 🔐 Admin check (set during admin login)
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  /* -------- LOAD JOBS -------- */
  const loadJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setJobs(data || []);
  };

  /* -------- LOAD APPLICATION COUNTS -------- */
  const loadApplicationCounts = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("job_id");

    if (error) {
      console.error(error);
      return;
    }

    const counts = {};
    data.forEach((app) => {
      if (!app.job_id) return;
      counts[app.job_id] = (counts[app.job_id] || 0) + 1;
    });

    setAppliedCounts(counts);
  };

  /* -------- INITIAL LOAD + AFTER APPLY -------- */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadJobs();
      await loadApplicationCounts();
      setLoading(false);
    };

    init();

    // 🔁 clear refresh flag after ApplyJob redirect
    if (location.state?.refresh) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  /* -------- LOAD SAVED JOBS -------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedJobs");
      if (raw) setSavedJobs(JSON.parse(raw));
    } catch {
      setSavedJobs([]);
    }
  }, []);

  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) => {
      const next = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];

      localStorage.setItem("savedJobs", JSON.stringify(next));
      return next;
    });
  };

  /* -------- DELETE JOB (ADMIN ONLY) -------- */
  const deleteJob = async (jobId) => {
    if (!isAdmin) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId);

    if (error) {
      console.error(error.message);
      alert("Failed to delete job");
    } else {
      // remove job instantly from UI
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    }
  };

  /* -------- FILTER -------- */
  const filteredJobs = jobs.filter((job) =>
    (job.title || "").toLowerCase().includes(titleQuery.toLowerCase()) &&
    (job.location || "").toLowerCase().includes(locationQuery.toLowerCase())
  );

  if (loading) {
    return (
      <main style={{ padding: "24px", color: "#111827" }}>
        Loading jobs...
      </main>
    );
  }

  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input
          placeholder="Search by title"
          value={titleQuery}
          onChange={(e) => setTitleQuery(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Search by location"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          style={inputStyle}
        />
        <button
          onClick={() => {
            setTitleQuery("");
            setLocationQuery("");
          }}
          style={clearBtn}
        >
          Clear Filters
        </button>
      </div>

      {/* Jobs */}
      {filteredJobs.length === 0 ? (
        <p style={{ color: "#374151" }}>No jobs found.</p>
      ) : (
        filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSaved={savedJobs.includes(job.id)}
            onToggleSave={() => toggleSaveJob(job.id)}
            appliedCount={appliedCounts[job.id] || 0}
            onDelete={isAdmin ? () => deleteJob(job.id) : undefined}
          />
        ))
      )}
    </main>
  );
}

/* -------- STYLES -------- */
const inputStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
};

const clearBtn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#ef4444",
  color: "white",
  cursor: "pointer",
};
