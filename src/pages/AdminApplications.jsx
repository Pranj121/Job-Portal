// src/pages/AdminApplications.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      const { data, error } = await supabase
        .from("applications")
        .select("id, job_id, name, email, resume_url, intro, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading applications:", error.message);
      } else {
        setApplications(data || []);
      }
      setLoading(false);
    }

    loadApplications();
  }, []);

  if (loading) {
    return <p style={{ color: "white" }}>Loading applications...</p>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: "16px" }}>All Applications (Admin)</h1>

      {applications.length === 0 ? (
        <p style={{ color: "white" }}>No applications yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "white",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #374151", padding: "8px" }}>
                ID
              </th>
              <th style={{ borderBottom: "1px solid #374151", padding: "8px" }}>
                Job ID
              </th>
              <th style={{ borderBottom: "1px solid #374151", padding: "8px" }}>
                Name
              </th>
              <th style={{ borderBottom: "1px solid #374151", padding: "8px" }}>
                Email
              </th>
              <th style={{ borderBottom: "1px solid #374151", padding: "8px" }}>
                Resume URL
              </th>
              <th style={{ borderBottom: "1px solid #374151", padding: "8px" }}>
                Intro
              </th>
              <th style={{ borderBottom: "1px solid #374151", padding: "8px" }}>
                Applied At
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td
                  style={{
                    borderBottom: "1px solid #111827",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {app.id}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #111827",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {app.job_id}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #111827",
                    padding: "8px",
                  }}
                >
                  {app.name}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #111827",
                    padding: "8px",
                  }}
                >
                  {app.email}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #111827",
                    padding: "8px",
                    maxWidth: "220px",
                    wordBreak: "break-all",
                  }}
                >
                  <a
                    href={app.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#60a5fa" }}
                  >
                    Open
                  </a>
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #111827",
                    padding: "8px",
                    maxWidth: "260px",
                  }}
                >
                  {app.intro}
                </td>
                <td
                  style={{
                    borderBottom: "1px solid #111827",
                    padding: "8px",
                  }}
                >
                  {new Date(app.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
