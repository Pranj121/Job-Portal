// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import PostJob from "./pages/PostJob";
import AdminLogin from "./pages/AdminLogin";
import Applications from "./pages/Applications";
import ApplyJob from "./pages/ApplyJob";
import SavedJobs from "./pages/SavedJobs";

function App() {
  // Theme state (persisted)
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  // Admin state (persisted)
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("isAdmin") === "true"
  );

  // Apply theme to <body>
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Admin login handler
  const handleAdminLogin = (password) => {
    const ADMIN_PASSWORD = "admin123"; // change if you want

    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
      return true; // success
    }
    return false; // wrong password
  };

  // Admin logout handler
  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  return (
    <Router>
      {/* Top navbar */}
      <Navbar
        theme={theme}
        setTheme={setTheme}
        isAdmin={isAdmin}
        onLogout={handleAdminLogout}
      />

      <div style={{ padding: "24px" }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />                              
          <Route path="/jobs/:id/apply" element={<ApplyJob />} />
          <Route path="/saved-jobs" element={<SavedJobs />} />

          {/* Admin login */}
          <Route
            path="/admin-login"
            element={<AdminLogin onLogin={handleAdminLogin} />}
          />

          {/* Protected: only admin can post jobs */}
          <Route
            path="/post-job"
            element={
              isAdmin ? <PostJob /> : <Navigate to="/admin-login" replace />
            }
          />

          {/* Protected: only admin can see applications */}
          <Route
            path="/applications"
            element={
              isAdmin ? (
                <Applications />
              ) : (
                <Navigate to="/admin-login" replace />
              )
            }
          />

          {/* Fallback: anything wrong -> /jobs */}
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
