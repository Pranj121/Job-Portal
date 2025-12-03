// src/pages/ApplyJob.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ApplyJob() {
  const { id } = useParams(); // job id from URL
  const navigate = useNavigate();

  // Job info
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [applicationsCount, setApplicationsCount] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [intro, setIntro] = useState("");

  // UX / validation state
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  // Refs to focus first invalid field
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const resumeRef = useRef(null);
  const introRef = useRef(null);

  const MIN_INTRO_LENGTH = 30;
  const draftKey = `draft_application_job_${id}`;
  const profileKey = "applicant_profile_v1";

  const introTemplates = [
    "I have strong experience with the required technologies and I’m confident I can quickly start contributing to your team.",
    "I’m excited about this role because it perfectly matches my skills and long-term career goals.",
    "I’ve previously worked on similar projects and would love to bring that experience to your organisation.",
  ];

  // ===== Load draft OR last used name/email on mount =====
  useEffect(() => {
    let filledFromDraft = false;

    try {
      const rawDraft = localStorage.getItem(draftKey);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft) || {};
        if (draft.name) setName(draft.name);
        if (draft.email) setEmail(draft.email);
        if (draft.resumeUrl) setResumeUrl(draft.resumeUrl);
        if (draft.intro) setIntro(draft.intro);
        setDraftLoaded(true);
        filledFromDraft = true;
      }
    } catch (e) {
      console.warn("Could not parse draft:", e);
    }

    // If there is no draft, pre-fill from last application
    if (!filledFromDraft) {
      const storedName = localStorage.getItem("lastApplicantName");
      const storedEmail = localStorage.getItem("lastApplicantEmail");

      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
    }

    // Check if profile exists
    try {
      const rawProfile = localStorage.getItem(profileKey);
      if (rawProfile) {
        setHasProfile(true);
      }
    } catch (e) {
      console.warn("Could not read profile:", e);
    }
  }, [draftKey, profileKey]);

  // ===== Load job and applications count =====
  useEffect(() => {
    const loadData = async () => {
      setLoadingJob(true);

      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (jobError) {
        console.error("Error loading job:", jobError.message);
        setJob(null);
      } else {
        setJob(jobData);
      }

      // Count applications for this job
      const { data: appsForJob, error: appsError } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", id);

      if (appsError) {
        console.error("Error loading application count:", appsError.message);
        setApplicationsCount(null);
      } else if (appsForJob) {
        setApplicationsCount(appsForJob.length);
      }

      setLoadingJob(false);
    };

    if (id) loadData();
  }, [id]);

  // ===== Autosave draft whenever fields change =====
  useEffect(() => {
    const allEmpty = [name, email, resumeUrl, intro].every((v) => !v.trim());
    if (allEmpty) {
      localStorage.removeItem(draftKey);
      return;
    }

    const draft = { name, email, resumeUrl, intro };
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch (e) {
      console.warn("Could not save draft:", e);
    }
  }, [draftKey, name, email, resumeUrl, intro]);

  const handleClearDraft = () => {
    localStorage.removeItem(draftKey);
    setName("");
    setEmail("");
    setResumeUrl("");
    setIntro("");
    setErrors({});
    setDraftLoaded(false);
    setSuccessInfo(null);
    alert("Draft cleared.");
  };

  // ===== Profile helpers =====
  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim() || !resumeUrl.trim()) {
      alert(
        "Please fill at least name, email and resume link before saving profile."
      );
      return;
    }

    const profile = {
      name: name.trim(),
      email: email.trim(),
      resumeUrl: resumeUrl.trim(),
      introTemplate: intro.trim(),
    };

    try {
      localStorage.setItem(profileKey, JSON.stringify(profile));
      setHasProfile(true);
      alert("Profile saved. You can reuse it next time.");
    } catch (e) {
      console.warn("Could not save profile:", e);
      alert("Could not save profile in this browser.");
    }
  };

  const handleUseProfile = () => {
    try {
      const raw = localStorage.getItem(profileKey);
      if (!raw) {
        alert("No saved profile found.");
        setHasProfile(false);
        return;
      }

      const profile = JSON.parse(raw) || {};
      if (profile.name) setName(profile.name);
      if (profile.email) setEmail(profile.email);
      if (profile.resumeUrl) setResumeUrl(profile.resumeUrl);
      if (profile.introTemplate && !intro.trim()) {
        setIntro(profile.introTemplate);
      }

      setSuccessInfo(null);
      setErrors({});
    } catch (e) {
      console.warn("Could not use profile:", e);
      alert("Could not load profile.");
    }
  };

  // ===== Helper: sample data for quick testing =====
  const handleUseSampleData = () => {
    setName("Pranjal Kumar");
    setEmail("pranjal@example.com");
    setResumeUrl("https://drive.google.com/your-resume-link");
    setIntro(
      "I am a motivated developer with experience in React, Node.js and SQL. I have built several small projects and I am excited to contribute to this role."
    );
    setErrors({});
    setSuccessInfo(null);
  };

  // ===== Derived values =====
  const isJobClosed =
    job && typeof job.status === "string" && job.status.toLowerCase() === "closed";

  const emailLooksValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const resumeLooksValid = /^https?:\/\//i.test(resumeUrl.trim());
  const introLongEnough = intro.trim().length >= MIN_INTRO_LENGTH;

  const completedPieces = [
    Boolean(name.trim()),
    emailLooksValid,
    resumeLooksValid,
    introLongEnough,
  ].filter(Boolean).length;

  const progressPercent = (completedPieces / 4) * 100;

  // Job posted time
  let postedLabel = "";
  if (job && job.created_at) {
    const created = new Date(job.created_at);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      postedLabel = "Posted today";
    } else if (diffDays === 1) {
      postedLabel = "Posted 1 day ago";
    } else {
      postedLabel = `Posted ${diffDays} days ago`;
    }
  }

  // ===== Validation =====
  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required.";

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailLooksValid) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!resumeUrl.trim()) {
      newErrors.resumeUrl = "Resume link is required.";
    } else if (!resumeLooksValid) {
      newErrors.resumeUrl = "Resume link should start with http:// or https://";
    }

    if (!intro.trim()) {
      newErrors.intro = "Please write a short intro.";
    } else if (!introLongEnough) {
      newErrors.intro = `Intro must be at least ${MIN_INTRO_LENGTH} characters.`;
    }

    setErrors(newErrors);
    return newErrors;
  };

  const focusFirstError = (errs) => {
    if (errs.name && nameRef.current) {
      nameRef.current.focus();
      return;
    }
    if (errs.email && emailRef.current) {
      emailRef.current.focus();
      return;
    }
    if (errs.resumeUrl && resumeRef.current) {
      resumeRef.current.focus();
      return;
    }
    if (errs.intro && introRef.current) {
      introRef.current.focus();
    }
  };

  // Prevent duplicate application (same job + email)
  const hasAlreadyApplied = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", id)
      .eq("email", email.trim())
      .limit(1);

    if (error) {
      console.error("Error checking existing application:", error.message);
      return false; // fail-open
    }

    return data && data.length > 0;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSuccessInfo(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      focusFirstError(validationErrors);
      return;
    }

    if (isJobClosed) {
      alert("This job is no longer accepting applications.");
      return;
    }

    setSubmitting(true);

    try {
      const already = await hasAlreadyApplied();
      if (already) {
        alert("You have already applied to this job with this email address.");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("applications").insert([
        {
          job_id: id,
          name: name.trim(),
          email: email.trim(),
          resume_url: resumeUrl.trim(),
          intro: intro.trim(),
        },
      ]);

      if (error) {
        console.error("Error submitting application:", error.message);
        alert("Failed to submit application. Please try again.");
      } else {
        // Save last used basic details
        localStorage.setItem("lastApplicantName", name.trim());
        localStorage.setItem("lastApplicantEmail", email.trim());

        setSuccessInfo({
          jobTitle: job ? job.title : "this job",
          email: email.trim(),
        });

        // Clear form + draft
        setName("");
        setEmail("");
        setResumeUrl("");
        setIntro("");
        setErrors({});
        localStorage.removeItem(draftKey);
        setDraftLoaded(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Extra helpers =====
  const handleOpenResumeLink = () => {
    if (!resumeLooksValid) {
      alert("Please enter a valid resume URL starting with http:// or https://");
      return;
    }
    try {
      window.open(resumeUrl.trim(), "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }
  };

  const handleCopySummary = async () => {
    const summaryLines = [
      `Job: ${job ? job.title : "Unknown"}`,
      `Company: ${job ? job.company : ""}`,
      "",
      `Name: ${name.trim() || "(not filled)"}`,
      `Email: ${email.trim() || "(not filled)"}`,
      `Resume: ${resumeUrl.trim() || "(not filled)"}`,
      "",
      "Intro:",
      intro.trim() || "(no intro written)",
    ];
    const summary = summaryLines.join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("Summary copied to clipboard.");
    } catch {
      setCopyStatus("Could not copy summary on this browser.");
    }

    setTimeout(() => setCopyStatus(""), 3000);
  };

  // ===== Loading / not found states =====
  if (loadingJob) {
    return (
      <main
        style={{
          padding: "24px",
          maxWidth: "880px",
          margin: "0 auto",
          color: "white",
        }}
      >
        Loading job...
      </main>
    );
  }

  if (!job) {
    return (
      <main
        style={{
          padding: "24px",
          maxWidth: "880px",
          margin: "0 auto",
          color: "white",
        }}
      >
        Job not found.
      </main>
    );
  }

  // ===== UI =====
  return (
    <main
      style={{
        padding: "24px",
        maxWidth: "1000px",
        margin: "0 auto",
        color: "white",
      }}
    >
      {/* Heading */}
      <h1 className="text-2xl font-semibold mb-2">Apply for {job.title}</h1>
      <p style={{ opacity: 0.8, marginBottom: "4px" }}>
        {job.company} — {job.location}
      </p>
      {postedLabel && (
        <p style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}>
          {postedLabel}
        </p>
      )}

      {/* Application count pill */}
      {applicationsCount !== null && (
        <p
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 10px",
            borderRadius: "999px",
            background: "rgba(15,118,110,0.25)",
            border: "1px solid rgba(45,212,191,0.7)",
            color: "#a5f3fc",
            fontSize: "12px",
            marginBottom: "10px",
          }}
        >
          {applicationsCount === 0
            ? "Be the first applicant!"
            : `${applicationsCount} application${
                applicationsCount === 1 ? "" : "s"
              } submitted so far`}
        </p>
      )}

      {/* Closed job indicator */}
      {isJobClosed && (
        <p
          style={{
            marginTop: "8px",
            marginBottom: "12px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "rgba(220,38,38,0.15)",
            border: "1px solid rgba(248,113,113,0.6)",
            color: "#fecaca",
            fontSize: "14px",
          }}
        >
          This job is currently closed and no longer accepting applications.
        </p>
      )}

      {/* Draft / prefill notice + profile + sample buttons */}
      <div
        style={{
          marginBottom: "16px",
          fontSize: "13px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
        }}
      >
        {draftLoaded ? (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              background: "rgba(37,99,235,0.15)",
              border: "1px solid rgba(129,140,248,0.7)",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>Draft loaded for this job.</span>
            <button
              type="button"
              onClick={handleClearDraft}
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                border: "none",
                background: "rgba(239,68,68,0.9)",
                color: "white",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Clear draft
            </button>
          </div>
        ) : (
          (localStorage.getItem("lastApplicantEmail") ||
            localStorage.getItem("lastApplicantName")) && (
            <p style={{ opacity: 0.75 }}>
              We pre-filled some details from your last application. Update
              anything if it has changed.
            </p>
          )
        )}

        {/* Profile + sample buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleSaveProfile}
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.8)",
              background: "transparent",
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Save as default profile
          </button>
          {hasProfile && (
            <button
              type="button"
              onClick={handleUseProfile}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                border: "none",
                background: "#2563eb",
                color: "white",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Fill from saved profile
            </button>
          )}
          <button
            type="button"
            onClick={handleUseSampleData}
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: "none",
              background: "#4b5563",
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Use sample data
          </button>
        </div>
      </div>

      {/* Success summary */}
      {successInfo && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "rgba(22,163,74,0.15)",
            border: "1px solid rgba(74,222,128,0.7)",
            color: "#bbf7d0",
            fontSize: "14px",
          }}
        >
          <strong>Application submitted!</strong>{" "}
          Your application for <strong>{successInfo.jobTitle}</strong> has been
          sent from <strong>{successInfo.email}</strong>.
        </div>
      )}

      {/* Progress bar + checklist */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "flex-start",
          marginBottom: "14px",
        }}
      >
        <div style={{ flex: 2, minWidth: "240px" }}>
          <p style={{ fontSize: "13px", opacity: 0.8, marginBottom: "4px" }}>
            Application progress
          </p>
          <div
            style={{
              width: "100%",
              height: "8px",
              borderRadius: "999px",
              background: "rgba(15,23,42,0.9)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg, #22c55e, #22d3ee)",
                transition: "width 0.2s ease-out",
              }}
            />
          </div>
          <p style={{ fontSize: "12px", opacity: 0.75, marginTop: "4px" }}>
            {completedPieces === 4
              ? "All sections complete – you’re ready to submit."
              : `${completedPieces}/4 key parts filled.`}
          </p>
        </div>

        {/* Mini checklist */}
        <div
          style={{
            flex: 3,
            minWidth: "240px",
            fontSize: "12px",
            padding: "8px 10px",
            borderRadius: "10px",
            border: "1px solid rgba(148,163,184,0.4)",
            background: "rgba(15,23,42,0.7)",
          }}
        >
          <p style={{ marginBottom: "4px", opacity: 0.85 }}>
            Checklist before you submit:
          </p>
          <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
            <li style={{ marginBottom: "2px" }}>
              {name.trim() ? "✅" : "⚠️"} Name filled
            </li>
            <li style={{ marginBottom: "2px" }}>
              {emailLooksValid ? "✅" : "⚠️"} Valid email address
            </li>
            <li style={{ marginBottom: "2px" }}>
              {resumeLooksValid ? "✅" : "⚠️"} Resume link starts with http:// or
              https://
            </li>
            <li>
              {introLongEnough ? "✅" : "⚠️"} Intro at least {MIN_INTRO_LENGTH}{" "}
              characters
            </li>
          </ul>
        </div>
      </div>

      {/* Tips toggle */}
      <button
        type="button"
        onClick={() => setShowTips((prev) => !prev)}
        style={{
          marginBottom: "10px",
          padding: "6px 12px",
          borderRadius: "999px",
          border: "1px solid rgba(148,163,184,0.7)",
          background: "transparent",
          color: "white",
          fontSize: "12px",
          cursor: "pointer",
        }}
      >
        {showTips ? "Hide writing tips" : "Show tips for a good application"}
      </button>

      {showTips && (
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 14px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.5)",
            background: "rgba(15,23,42,0.9)",
            fontSize: "12px",
          }}
        >
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            <li>Mention 2–3 concrete skills that match the job description.</li>
            <li>Keep the intro short (4–6 lines) and easy to read.</li>
            <li>Add a resume link that is public or shareable.</li>
            <li>Double-check spelling of your email and links.</li>
          </ul>
        </div>
      )}

      {/* Layout: form + live preview */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          alignItems: "flex-start",
        }}
      >
        {/* Form column */}
        <div style={{ flex: 1, minWidth: "260px" }}>
          <form
            onSubmit={handleApply}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {/* Name */}
            <div>
              <input
                ref={nameRef}
                placeholder="Your name"
                value={name}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: errors.name
                    ? "1px solid #f97373"
                    : "1px solid rgba(148,163,184,0.6)",
                  background: "#020617",
                  color: "white",
                }}
              />
              {errors.name && (
                <p
                  style={{
                    marginTop: "4px",
                    fontSize: "12px",
                    color: "#fecaca",
                  }}
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                ref={emailRef}
                placeholder="Your email"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: errors.email
                    ? "1px solid #f97373"
                    : "1px solid rgba(148,163,184,0.6)",
                  background: "#020617",
                  color: "white",
                }}
              />
              {errors.email && (
                <p
                  style={{
                    marginTop: "4px",
                    fontSize: "12px",
                    color: "#fecaca",
                  }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Resume URL + open button */}
            <div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  ref={resumeRef}
                  placeholder="Resume link (Google Drive, etc.)"
                  value={resumeUrl}
                  autoComplete="url"
                  onChange={(e) => setResumeUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: errors.resumeUrl
                      ? "1px solid #f97373"
                      : "1px solid rgba(148,163,184,0.6)",
                    background: "#020617",
                    color: "white",
                  }}
                />
                <button
                  type="button"
                  onClick={handleOpenResumeLink}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border: "1px solid rgba(148,163,184,0.8)",
                    background: "transparent",
                    color: "white",
                    fontSize: "12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Open link
                </button>
              </div>
              {errors.resumeUrl && (
                <p
                  style={{
                    marginTop: "4px",
                    fontSize: "12px",
                    color: "#fecaca",
                  }}
                >
                  {errors.resumeUrl}
                </p>
              )}
            </div>

            {/* Intro */}
            <div>
              <textarea
                ref={introRef}
                placeholder="Short intro / why you're a good fit"
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: errors.intro
                    ? "1px solid #f97373"
                    : "1px solid rgba(148,163,184,0.6)",
                  background: "#020617",
                  color: "white",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "4px",
                  fontSize: "12px",
                }}
              >
                {errors.intro ? (
                  <span style={{ color: "#fecaca" }}>{errors.intro}</span>
                ) : (
                  <span style={{ opacity: 0.75 }}>
                    Minimum {MIN_INTRO_LENGTH} characters
                  </span>
                )}
                <span
                  style={{
                    opacity: intro.length < MIN_INTRO_LENGTH ? 0.8 : 1,
                    color:
                      intro.length < MIN_INTRO_LENGTH ? "#fecaca" : "#a7f3d0",
                  }}
                >
                  {intro.length}/{MIN_INTRO_LENGTH}
                </span>
              </div>

              {/* Quick intro templates */}
              <div
                style={{
                  marginTop: "6px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  fontSize: "11px",
                }}
              >
                <span style={{ opacity: 0.8 }}>Quick templates:</span>
                {introTemplates.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setIntro((prev) =>
                        prev
                          ? prev.trimEnd() +
                            (prev.endsWith(" ") ? "" : " ") +
                            tpl
                          : tpl
                      )
                    }
                    style={{
                      padding: "4px 8px",
                      borderRadius: "999px",
                      border: "1px solid rgba(148,163,184,0.7)",
                      background: "transparent",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Template {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons row */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <button
                type="submit"
                disabled={submitting || isJobClosed}
                style={{
                  padding: "10px 24px",
                  borderRadius: "999px",
                  border: "none",
                  background: isJobClosed ? "#4b5563" : "#16a34a",
                  color: "white",
                  cursor: submitting || isJobClosed ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {submitting ? (
                  <>
                    <span
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "999px",
                        border: "2px solid rgba(255,255,255,0.6)",
                        borderTopColor: "transparent",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Submitting...
                  </>
                ) : (
                  "Submit application"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/jobs/${id}`)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.8)",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ← Back to job details
              </button>
            </div>
          </form>
        </div>

        {/* Live preview column */}
        <div
          style={{
            flex: 1,
            minWidth: "260px",
            padding: "14px 16px",
            borderRadius: "16px",
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.35)",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "6px",
              opacity: 0.95,
            }}
          >
            Application preview
          </h2>
          <p style={{ fontSize: "13px", opacity: 0.8, marginBottom: "10px" }}>
            This is roughly how your application will look to the admin.
          </p>

          <div style={{ marginBottom: "8px" }}>
            <p style={{ fontWeight: 600 }}>
              {name.trim() || "Your full name"}
            </p>
            <p style={{ fontSize: "13px", opacity: 0.8 }}>
              {email.trim() || "email@example.com"}
            </p>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <p style={{ fontSize: "13px" }}>
              <strong>Resume: </strong>
              {resumeUrl.trim() || "No resume link added yet"}
            </p>
          </div>

          <div>
            <p style={{ fontSize: "13px", marginBottom: "4px" }}>
              <strong>Intro</strong>
            </p>
            <p
              style={{
                fontSize: "13px",
                opacity: intro ? 0.95 : 0.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {intro.trim() ||
                "Write a short paragraph explaining your experience and why you're a good fit for this role."}
            </p>
          </div>

          {/* Copy summary */}
          <div style={{ marginTop: "12px" }}>
            <button
              type="button"
              onClick={handleCopySummary}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.8)",
                background: "transparent",
                color: "white",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Copy application summary
            </button>
            {copyStatus && (
              <p
                style={{
                  marginTop: "4px",
                  fontSize: "11px",
                  opacity: 0.8,
                }}
              >
                {copyStatus}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Tiny keyframes for spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </main>
  );
}
