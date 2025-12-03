// src/pages/Jobs.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import JobCard from "../components/JobCard";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [titleQuery, setTitleQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const [appliedCounts, setAppliedCounts] = useState({}); // { job_id: count }

  // Load jobs
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading jobs:", error.message);
        setJobs([]);
      } else {
        setJobs(data || []);
      }

      setLoading(false);
    };

    loadJobs();
  }, []);

  // Load applications and compute "already applied" counts
  useEffect(() => {
    const loadApplications = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("job_id");

      if (error) {
        console.error("Error loading applications:", error.message);
        setAppliedCounts({});
        return;
      }

      const counts = {};
      (data || []).forEach((app) => {
        if (!app.job_id) return;
        counts[app.job_id] = (counts[app.job_id] || 0) + 1;
      });

      setAppliedCounts(counts);
    };

    loadApplications();
  }, []);

  // Saved jobs (from localStorage)
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedJobs");
      if (raw) {
        setSavedJobs(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Error reading savedJobs from localStorage", e);
    }
  }, []);

  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) => {
      let next;
      if (prev.includes(jobId)) {
        next = prev.filter((id) => id !== jobId);
      } else {
        next = [...prev, jobId];
      }
      localStorage.setItem("savedJobs", JSON.stringify(next));
      return next;
    });
  };

  const handleClearFilters = () => {
    setTitleQuery("");
    setLocationQuery("");
  };

  // Apply filters
  const filteredJobs = jobs.filter((job) => {
    const matchesTitle = job.title
      .toLowerCase()
      .includes(titleQuery.toLowerCase());

    const matchesLocation = job.location
      .toLowerCase()
      .includes(locationQuery.toLowerCase());

    return matchesTitle && matchesLocation;
  });

  if (loading) {
    return (
      <main style={{ padding: "24px", color: "white" }}>Loading jobs...</main>
    );
  }

  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Filters row */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          alignItems: "center",
        }}
      >
        <input
          placeholder="Search by title"
          value={titleQuery}
          onChange={(e) => setTitleQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "999px",
            border: "1px solid #e5e7eb",
          }}
        />
        <input
          placeholder="Search by location"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "999px",
            border: "1px solid #e5e7eb",
          }}
        />
        <button
          onClick={handleClearFilters}
          style={{
            padding: "10px 18px",
            borderRadius: "999px",
            border: "none",
            background: "#fb7185",
            color: "white",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Job list */}
      {filteredJobs.length === 0 ? (
        <p style={{ color: "white" }}>No jobs found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobs.includes(job.id)}
              onToggleSave={() => toggleSaveJob(job.id)}
              appliedCount={appliedCounts[job.id] || 0}
            />
          ))}
        </div>
      )}
    </main>
  );
}
