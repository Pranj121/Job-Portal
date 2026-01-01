// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const navigate = useNavigate();

  const [totalJobs, setTotalJobs] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [recentJobs, setRecentJobs] = useState([]);
  const [mostAppliedJob, setMostAppliedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);

      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, company, location, created_at");

      if (jobsError) {
        console.error(jobsError.message);
        setLoading(false);
        return;
      }

      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("job_id");

      if (appsError) {
        console.error(appsError.message);
        setLoading(false);
        return;
      }

      setTotalJobs(jobs.length);
      setTotalApplications(apps.length);
      setCompanyCount(new Set(jobs.map((j) => j.company)).size);

      const sortedJobs = [...jobs].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentJobs(sortedJobs.slice(0, 3));

      if (apps.length > 0) {
        const counts = {};
        apps.forEach((a) => {
          counts[a.job_id] = (counts[a.job_id] || 0) + 1;
        });

        const bestJobId = Object.keys(counts).reduce((a, b) =>
          counts[a] > counts[b] ? a : b
        );

        const job = jobs.find((j) => String(j.id) === String(bestJobId));
        if (job) {
          setMostAppliedJob({ ...job, applications: counts[bestJobId] });
        }
      }

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: "40px", textAlign: "center" }}>
        Loading dashboard...
      </main>
    );
  }

  const statCard = {
    flex: 1,
    minWidth: "220px",
    padding: "18px",
    borderRadius: "14px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  };

  return (
    <main style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <section style={{ textAlign: "center", marginBottom: "36px" }}>
        <h1 className="text-3xl font-semibold mb-2">
          Welcome to the Job Portal
        </h1>
        <p style={{ color: "#6b7280" }}>
          Browse jobs, track applications, and manage postings.
        </p>
      </section>

      {/* Stats */}
      <section
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "36px",
        }}
      >
        <div style={statCard}>
          <p>Total jobs</p>
          <h2>{totalJobs}</h2>
        </div>

        <div style={statCard}>
          <p>Total applications</p>
          <h2>{totalApplications}</h2>
        </div>

        <div style={statCard}>
          <p>Average applications per job</p>
          <h2>
            {totalJobs ? (totalApplications / totalJobs).toFixed(1) : 0}
          </h2>
        </div>

        <div style={statCard}>
          <p>Companies hiring</p>
          <h2>{companyCount}</h2>
        </div>
      </section>

      {/* Most applied job */}
      {mostAppliedJob && (
        <section
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            marginBottom: "32px",
          }}
        >
          <h2 className="text-lg font-semibold mb-2">
            Most applied job
          </h2>
          <p>{mostAppliedJob.title}</p>
          <p style={{ color: "#6b7280" }}>
            {mostAppliedJob.company} — {mostAppliedJob.location}
          </p>
          <p style={{ marginTop: "6px" }}>
            Applications received: {mostAppliedJob.applications}
          </p>

          <button
            onClick={() => navigate(`/jobs/${mostAppliedJob.id}`)}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              borderRadius: "999px",
              background: "#2563eb",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            View job
          </button>
        </section>
      )}

      {/* Recent jobs */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <h2 className="text-lg font-semibold">Recent jobs</h2>
          <button
            onClick={() => navigate("/jobs")}
            style={{
              background: "none",
              border: "none",
              color: "#2563eb",
              cursor: "pointer",
            }}
          >
            See all jobs
          </button>
        </div>

        {recentJobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {recentJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  flex: 1,
                  minWidth: "260px",
                  padding: "16px",
                  borderRadius: "14px",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                }}
              >
                <p style={{ fontWeight: 600 }}>{job.title}</p>
                <p style={{ color: "#6b7280" }}>{job.company}</p>
                <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                  {job.location}
                </p>

                <button
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  style={{
                    marginTop: "8px",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: "1px solid #111827",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  View details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", marginTop: "32px" }}>
        <button
          onClick={() => navigate("/jobs")}
          style={{
            padding: "10px 28px",
            borderRadius: "999px",
            background: "#2563eb",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Browse all jobs
        </button>
      </section>
    </main>
  );
}
