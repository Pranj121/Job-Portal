// src/pages/SavedJobs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function SavedJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [appliedIds, setAppliedIds] = useState([]);

  // Load applied jobs (for badge)
  useEffect(() => {
    const storedApplied = JSON.parse(
      localStorage.getItem("appliedJobs") || "[]"
    );
    setAppliedIds(storedApplied);
  }, []);

  // Load saved jobs
  useEffect(() => {
    const loadSavedJobs = async () => {
      setLoading(true);

      const savedIds = JSON.parse(
        localStorage.getItem("savedJobs") || "[]"
      );

      if (!savedIds.length) {
        setJobs([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .in("id", savedIds);

      if (error) {
        console.error("Error loading saved jobs:", error.message);
        setJobs([]);
      } else {
        // Preserve saved order
        const ordered = savedIds
          .map((id) => data.find((j) => String(j.id) === String(id)))
          .filter(Boolean);
        setJobs(ordered);
      }

      setLoading(false);
    };

    loadSavedJobs();
  }, []);

  const handleClearAll = () => {
    if (!window.confirm("Remove all saved jobs?")) return;
    localStorage.removeItem("savedJobs");
    setJobs([]);
  };

  const handleRemoveOne = (id) => {
    const savedIds = JSON.parse(
      localStorage.getItem("savedJobs") || "[]"
    );
    const next = savedIds.filter((x) => String(x) !== String(id));
    localStorage.setItem("savedJobs", JSON.stringify(next));
    setJobs((prev) => prev.filter((j) => String(j.id) !== String(id)));
  };

  const handleExportCsv = () => {
    if (!jobs.length) return;

    const headers = ["Title", "Company", "Location", "Type", "Description"];
    const rows = jobs.map((j) => [
      j.title || "",
      j.company || "",
      j.location || "",
      j.type || j.job_type || "",
      (j.description || "").replace(/\s+/g, " "),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saved-jobs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Search, sort, group by company
  const groupedJobs = useMemo(() => {
    let filtered = jobs;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.company?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q)
      );
    }

    filtered = [...filtered].sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    const groups = {};
    filtered.forEach((job) => {
      const key = job.company || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(job);
    });

    return groups;
  }, [jobs, search, sortOrder]);

  if (loading) {
    return (
      <main style={{ padding: "32px 24px" }}>
        Loading saved jobs...
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "32px 24px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: "24px" }}>
        <h1 className="text-2xl font-semibold mb-1">Saved Jobs</h1>
        <p style={{ opacity: 0.8, fontSize: "14px" }}>
          Jobs you have bookmarked to review later.
        </p>
      </header>

      {/* Summary + actions */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            background: "#eef2ff",
            fontSize: "13px",
          }}
        >
          You have <strong>{jobs.length}</strong> saved job
          {jobs.length === 1 ? "" : "s"}.
        </span>

        <button
          onClick={handleExportCsv}
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            border: "none",
            background: "#3b82f6",
            color: "white",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Export CSV
        </button>

        <button
          onClick={handleClearAll}
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            border: "none",
            background: "#f97373",
            color: "white",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Clear All
        </button>
      </div>

      {/* Search + sort */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Search by title, company or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "260px",
            padding: "10px 14px",
            borderRadius: "999px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
          }}
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "999px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Grouped jobs */}
      {Object.keys(groupedJobs).length === 0 ? (
        <p style={{ opacity: 0.8 }}>
          No saved jobs match your filters.
        </p>
      ) : (
        Object.entries(groupedJobs).map(([company, companyJobs]) => (
          <section key={company} style={{ marginBottom: "24px" }}>
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              {company}
            </h2>

            {companyJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  marginBottom: "10px",
                }}
              >
                <div style={{ maxWidth: "70%" }}>
                  <p style={{ fontSize: "15px", fontWeight: 600 }}>
                    {job.title}
                  </p>
                  <p style={{ fontSize: "13px", color: "#4b5563" }}>
                    {job.company} — {job.location}
                  </p>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>
                    {job.type || job.job_type || "Job type not specified"}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    alignItems: "flex-end",
                  }}
                >
                  {appliedIds.includes(job.id) && (
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: "#dcfce7",
                        color: "#166534",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      Applied
                    </span>
                  )}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "999px",
                        border: "1px solid #111827",
                        background: "white",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleRemoveOne(job.id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "999px",
                        border: "none",
                        background: "#f97373",
                        color: "white",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        ))
      )}
    </main>
  );
}

