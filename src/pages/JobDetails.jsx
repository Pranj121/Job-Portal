// src/pages/JobDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // detect admin from localStorage
  useEffect(() => {
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
  }, []);

  // load job
  useEffect(() => {
    const loadJob = async () => {
      setLoadingJob(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading job:", error.message);
      }
      setJob(data);
      setLoadingJob(false);
    };

    if (id) loadJob();
  }, [id]);

  // load applications for this job (only for admin)
  useEffect(() => {
    const loadApps = async () => {
      setLoadingApps(true);
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("job_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading applications:", error.message);
        setApplications([]);
      } else {
        setApplications(data || []);
      }
      setLoadingApps(false);
    };

    if (isAdmin && id) loadApps();
  }, [id, isAdmin]);

  // delete job + all its applications (admin only)
  const handleDeleteJob = async () => {
    if (!window.confirm("Delete this job and all its applications?")) return;

    setDeleting(true);
    await supabase.from("applications").delete().eq("job_id", id);
    await supabase.from("jobs").delete().eq("id", id);
    setDeleting(false);

    alert("Job deleted.");
    navigate("/jobs");
  };

  if (loadingJob) {
    return (
      <main style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
        Loading job…
      </main>
    );
  }

  if (!job) {
    return (
      <main style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
        Job not found.
      </main>
    );
  }

  const actionButtonBase = {
    padding: "10px 22px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "14px",
  };

  return (
    <main
      style={{
        padding: "32px 24px",
        maxWidth: "1000px",
        margin: "0 auto",
        color: "#111827",
      }}
    >
      {/* Job info */}
      <section style={{ marginBottom: "24px" }}>
        <h1 className="text-2xl font-semibold mb-2">{job.title}</h1>
        <p style={{ opacity: 0.8 }}>
          {job.company} — {job.location}
        </p>
        <p style={{ marginTop: "10px", lineHeight: 1.6 }}>{job.description}</p>

        {/* Buttons row */}
        <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
          <button
            onClick={() => navigate(`/jobs/${job.id}/apply`)}
            style={{
              ...actionButtonBase,
              background: "#2563eb",
              color: "white",
            }}
          >
            Apply Now
          </button>

          {isAdmin && (
            <button
              onClick={handleDeleteJob}
              disabled={deleting}
              style={{
                ...actionButtonBase,
                background: "#dc2626",
                color: "white",
                opacity: deleting ? 0.8 : 1,
              }}
            >
              {deleting ? "Deleting…" : "Delete job"}
            </button>
          )}
        </div>
      </section>

      {/* Applications (admin view) */}
      {isAdmin && (
        <section style={{ marginTop: "12px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "10px",
            }}
          >
            Applications ({applications.length})
          </h2>

          {loadingApps ? (
            <p>Loading applications…</p>
          ) : applications.length === 0 ? (
            <p>No applications yet for this job.</p>
          ) : (
            <div
              style={{
                padding: "16px",
                borderRadius: "20px",
                background: "#f3f4f6", // light grey panel so it stands out
                border: "1px solid #e5e7eb",
              }}
            >
              {applications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "14px",
                    background: "#ffffff", // white card
                    border: "1px solid #d1d5db",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.06)", // shadow so it’s clearly visible
                    marginBottom: "10px",
                  }}
                >
                  <p>
                    <strong>{app.name}</strong>{" "}
                    <span style={{ opacity: 0.8 }}>({app.email})</span>
                  </p>

                  <p style={{ marginTop: "4px" }}>
                    <strong>Resume: </strong>
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "underline" }}
                    >
                      {app.resume_url}
                    </a>
                  </p>

                  <p style={{ marginTop: "6px" }}>
                    <strong>Intro: </strong>
                    {app.intro || "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
