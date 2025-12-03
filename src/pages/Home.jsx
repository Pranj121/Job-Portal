// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const navigate = useNavigate();

  const [totalJobs, setTotalJobs] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);

  const [recentJobs, setRecentJobs] = useState([]); // last 3 jobs
  const [mostAppliedJob, setMostAppliedJob] = useState(null); // job with max apps

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);

      // 1) Load jobs (lightweight fields)
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, company, location, created_at");

      if (jobsError) {
        console.error("Error loading jobs:", jobsError.message);
        setLoading(false);
        return;
      }

      // 2) Load applications (only job_id)
      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("job_id");

      if (appsError) {
        console.error("Error loading applications:", appsError.message);
        setLoading(false);
        return;
      }

      // === Stats ===
      const totalJobsCount = jobs.length;
      const totalAppsCount = apps.length;

      setTotalJobs(totalJobsCount);
      setTotalApplications(totalAppsCount);

      // Unique companies
      const uniqueCompanies = new Set(jobs.map((j) => j.company));
      setCompanyCount(uniqueCompanies.size);

      // Recent 3 jobs (sorted by created_at desc)
      const sortedJobs = [...jobs].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentJobs(sortedJobs.slice(0, 3));

      // Most applied job
      if (apps.length > 0 && jobs.length > 0) {
        const counts = {};
        apps.forEach((app) => {
          if (!app.job_id) return;
          counts[app.job_id] = (counts[app.job_id] || 0) + 1;
        });

        let bestJobId = null;
        let bestCount = 0;
        Object.entries(counts).forEach(([jobId, count]) => {
          if (count > bestCount) {
            bestJobId = jobId;
            bestCount = count;
          }
        });

        const jobObj = jobs.find((j) => String(j.id) === String(bestJobId));
        if (jobObj) {
          setMostAppliedJob({ ...jobObj, applications: bestCount });
        }
      }

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const avgApplications =
    totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0;

  if (loading) {
    return (
      <main
        style={{
          padding: "40px 24px",
          maxWidth: "900px",
          margin: "0 auto",
          color: "#111827",
        }}
      >
        Loading dashboard...
      </main>
    );
  }

  // === Styles ===
  const cardStyle = {
    flex: 1,
    minWidth: "220px",
    padding: "18px 20px",
    borderRadius: "20px",
    background: "#111827", // dark so it pops
    color: "white",
    boxShadow: "0 14px 28px rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  const labelStyle = {
    fontSize: "12px",
    opacity: 0.8,
    marginBottom: "6px",
  };

  const valueStyle = {
    fontSize: "24px",
    fontWeight: 600,
  };

  return (
    <main
      style={{
        padding: "40px 24px",
        maxWidth: "1100px",
        margin: "0 auto",
        color: "#111827",
      }}
    >
      {/* Heading */}
      <section style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="text-3xl font-semibold mb-2">
          Welcome to the Job Portal
        </h1>
        <p style={{ opacity: 0.8 }}>
          Browse jobs, track applications and manage postings in one place.
        </p>
      </section>

      {/* Stats cards */}
      <section
        style={{
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        <div style={cardStyle}>
          <p style={labelStyle}>Total jobs</p>
          <p style={valueStyle}>{totalJobs}</p>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Total applications</p>
          <p style={valueStyle}>{totalApplications}</p>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Avg applications per job</p>
          <p style={valueStyle}>{avgApplications}</p>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Companies hiring</p>
          <p style={valueStyle}>{companyCount}</p>
        </div>
      </section>

      {/* Most popular job */}
      {mostAppliedJob && (
        <section
          style={{
            marginBottom: "32px",
            padding: "18px 20px",
            borderRadius: "20px",
            background: "rgba(17,24,39,0.9)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
            color: "white",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Most popular job 🎯
          </h2>
          <p style={{ fontSize: "16px", fontWeight: 500 }}>
            {mostAppliedJob.title}
          </p>
          <p style={{ opacity: 0.8 }}>{mostAppliedJob.company}</p>
          <p style={{ opacity: 0.7, fontSize: "14px", marginTop: "4px" }}>
            {mostAppliedJob.location}
          </p>
          <p style={{ marginTop: "8px", fontSize: "14px" }}>
            <strong>{mostAppliedJob.applications}</strong> application
            {mostAppliedJob.applications > 1 ? "s" : ""} received
          </p>
          <button
            onClick={() => navigate(`/jobs/${mostAppliedJob.id}`)}
            style={{
              marginTop: "10px",
              padding: "8px 18px",
              borderRadius: "999px",
              border: "none",
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            View job
          </button>
        </section>
      )}

      {/* Recent jobs */}
      <section style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "12px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Recent jobs
          </h2>

          {/* See all jobs link */}
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            style={{
              background: "transparent",
              border: "none",
              color: "#2563eb",
              cursor: "pointer",
              fontSize: "14px",
              padding: 0,
            }}
          >
            See all jobs →
          </button>
        </div>

        {recentJobs.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No jobs posted yet.</p>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {recentJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  flex: 1,
                  minWidth: "260px",
                  padding: "14px 16px",
                  borderRadius: "16px",
                  background: "#f9fafb",
                  color: "#111827",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {job.title}
                  </p>
                  <p style={{ fontSize: "14px", color: "#374151" }}>
                    {job.company}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      marginTop: "2px",
                    }}
                  >
                    {job.location}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  style={{
                    marginTop: "10px",
                    alignSelf: "flex-start",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: "1px solid #111827", // ✅ fixed string here
                    background: "white",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  View details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick action */}
      <section style={{ textAlign: "center", marginTop: "10px" }}>
        <button
          onClick={() => navigate("/jobs")}
          style={{
            padding: "10px 28px",
            borderRadius: "999px",
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Browse all jobs
        </button>
      </section>
    </main>
  );
}
