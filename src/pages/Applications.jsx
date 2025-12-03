// src/pages/Applications.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);

      // Load applications + related job info
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          job_id,
          name,
          email,
          resume_url,
          intro,
          created_at,
          jobs (
            title,
            company,
            location
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading applications:", error.message);
        setApplications([]);
      } else {
        setApplications(data || []);
      }

      setLoading(false);
    };

    loadApplications();
  }, []);

  // ---------- derived data ----------

  // All unique jobs (for dropdown)
  const jobOptions = useMemo(() => {
    const map = new Map();
    applications.forEach((app) => {
      if (!app.job_id) return;
      const job = app.jobs || {};
      if (!map.has(app.job_id)) {
        map.set(app.job_id, job.title || "Untitled job");
      }
    });

    return Array.from(map.entries()).map(([id, title]) => ({
      id,
      title,
    }));
  }, [applications]);

  // Filter + search + sort
  const visibleApplications = useMemo(() => {
    let list = applications;

    // Filter by job
    if (selectedJobId !== "all") {
      list = list.filter((a) => String(a.job_id) === String(selectedJobId));
    }

    // Search by job title or applicant name
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      list = list.filter((app) => {
        const jobTitle = app.jobs?.title || "";
        const applicant = app.name || "";
        return (
          jobTitle.toLowerCase().includes(term) ||
          applicant.toLowerCase().includes(term)
        );
      });
    }

    // Sort by date
    const sorted = [...list].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return sorted;
  }, [applications, selectedJobId, searchTerm, sortOrder]);

  // Summary stats
  const totalApps = applications.length;
  const jobsWithApps = new Set(
    applications.map((a) => (a.job_id ? String(a.job_id) : null)).filter(Boolean)
  ).size;
  const uniqueApplicants = new Set(
    applications.map((a) => (a.email ? a.email.toLowerCase() : null)).filter(
      Boolean
    )
  ).size;

  // ---------- CSV export ----------

  const handleExportCsv = () => {
    if (visibleApplications.length === 0) {
      alert("No applications to export.");
      return;
    }

    const header = [
      "Job Title",
      "Company",
      "Location",
      "Applicant Name",
      "Applicant Email",
      "Resume URL",
      "Intro",
      "Applied At",
    ];

    const rows = visibleApplications.map((app) => {
      const job = app.jobs || {};
      return [
        (job.title || "").replace(/"/g, '""'),
        (job.company || "").replace(/"/g, '""'),
        (job.location || "").replace(/"/g, '""'),
        (app.name || "").replace(/"/g, '""'),
        (app.email || "").replace(/"/g, '""'),
        (app.resume_url || "").replace(/"/g, '""'),
        (app.intro || "").replace(/"/g, '""'),
        app.created_at || "",
      ];
    });

    const csvLines = [
      header.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "applications.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // ---------- styles ----------

  const mainStyle = {
    padding: "40px 24px",
    maxWidth: "1100px",
    margin: "0 auto",
    color: "#111827",
  };

  const toolbarRow = {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
    marginBottom: "20px",
  };

  const searchInputStyle = {
    flex: "1 1 260px",
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
  };

  const selectStyle = {
    padding: "9px 12px",
    borderRadius: "999px",
    border: "1px solid #d1d5db",
    fontSize: "13px",
    background: "white",
  };

  const pillButton = {
    padding: "8px 14px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  };

  const exportBtnStyle = {
    ...pillButton,
    background: "#2563eb",
    color: "white",
  };

  const statsBar = {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "24px",
    fontSize: "13px",
  };

  const statChip = {
    padding: "6px 12px",
    borderRadius: "999px",
    background: "#111827",
    color: "white",
    fontSize: "12px",
  };

  const cardStyle = {
    padding: "18px 20px",
    borderRadius: "20px",
    marginBottom: "18px",
    background: "#111827", // dark card
    color: "white",
    boxShadow: "0 18px 30px rgba(15, 23, 42, 0.55)",
    border: "1px solid rgba(148, 163, 184, 0.5)",
  };

  const subtleText = {
    fontSize: "13px",
    opacity: 0.8,
  };

  const labelStyle = {
    fontWeight: 600,
  };

  const valueLinkStyle = {
    color: "#93c5fd",
    textDecoration: "underline",
    wordBreak: "break-all",
  };

  return (
    <main style={mainStyle}>
      <h1 className="text-2xl font-semibold mb-2">Applications</h1>
      <p style={{ opacity: 0.75, marginBottom: "12px" }}>
        View and filter all applications submitted to your jobs.
      </p>

      {/* Summary chips */}
      <div style={statsBar}>
        <span style={statChip}>Total applications: {totalApps}</span>
        <span style={statChip}>Jobs with applications: {jobsWithApps}</span>
        <span style={statChip}>Unique applicants: {uniqueApplicants}</span>
      </div>

      {/* Toolbar: search + filters + export */}
      <div style={toolbarRow}>
        <input
          type="text"
          placeholder="Search by job title or applicant name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />

        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All jobs</option>
          {jobOptions.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={selectStyle}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>

        <button type="button" onClick={handleExportCsv} style={exportBtnStyle}>
          Export CSV
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p>Loading applications...</p>
      ) : visibleApplications.length === 0 ? (
        <p>No applications found for the current filters.</p>
      ) : (
        visibleApplications.map((app) => {
          const job = app.jobs || {};
          return (
            <div key={app.id} style={cardStyle}>
              {/* Job info */}
              <p style={{ fontWeight: 600, fontSize: "16px" }}>
                {job.title || "Unknown job"}
              </p>
              <p style={subtleText}>
                {job.company || "Unknown company"}
                {job.location ? ` — ${job.location}` : ""}
              </p>

              {/* Applicant details */}
              <p style={{ marginTop: "10px", fontSize: "14px" }}>
                <span style={labelStyle}>Applicant: </span>
                {app.name} ({app.email})
              </p>

              <p style={{ marginTop: "6px", fontSize: "14px" }}>
                <span style={labelStyle}>Resume: </span>
                {app.resume_url ? (
                  <a
                    href={app.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    style={valueLinkStyle}
                  >
                    {app.resume_url}
                  </a>
                ) : (
                  <span style={subtleText}>No resume link provided</span>
                )}
              </p>

              <p style={{ marginTop: "6px", fontSize: "14px" }}>
                <span style={labelStyle}>Intro: </span>
                {app.intro ? (
                  <span>{app.intro}</span>
                ) : (
                  <span style={subtleText}>No intro provided</span>
                )}
              </p>

              <p style={{ marginTop: "8px", fontSize: "12px", opacity: 0.7 }}>
                Applied at:{" "}
                {app.created_at
                  ? new Date(app.created_at).toLocaleString()
                  : "Unknown"}
              </p>
            </div>
          );
        })
      )}
    </main>
  );
}
