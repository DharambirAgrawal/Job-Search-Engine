import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import { api } from "../services/api";
import "../styles/App.css";

// Import components
import Users from "./Users";
import Jobs from "./Jobs";
import Match from "./Match";
import Search from "./Search";
import Skills from "./Skills";
import Insights from "./Insights";
import Toast from "./Toast";

function RouteTitle() {
  const location = useLocation();

  useEffect(() => {
    // set simple document title per route for SEO / clarity
    const path = location.pathname.replace("/", "") || "users";
    const titleMap = {
      users: "Users - Job Search Engine",
      jobs: "Jobs - Job Search Engine",
      match: "Match - Job Search Engine",
      search: "Search - Job Search Engine",
      skills: "Skills - Job Search Engine",
      insights: "AI Insights - Job Search Engine",
    };
    document.title = titleMap[path] || "Job Search Engine";
  }, [location]);

  return null;
}

const THEME_KEY = "jse-theme";

function App() {
  const [counts, setCounts] = useState({ users: 0, jobs: 0 });
  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || "light"
  );

  useEffect(() => {
    let mounted = true;
    const loadCounts = async () => {
      try {
        const [usersData, jobsData] = await Promise.all([
          api.getUsers(),
          api.getJobs(),
        ]);
        if (mounted) {
          setCounts({
            users: (usersData || []).length,
            jobs: (jobsData || []).length,
          });
        }
      } catch (e) {
        /* ignore */
      }
    };
    loadCounts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // apply theme class to body
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <Router>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="container">
        <header role="banner">
          <div className="theme-toggle-wrapper">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>
          <h1>Job Search Engine</h1>
          <p aria-describedby="app-status">A skill-based job matching system</p>
          <div className="header-stats" aria-hidden={false}>
            <div
              className="stat-card"
              role="status"
              aria-label={`Total users ${counts.users}`}
            >
              <div className="stat-value" data-testid="user-count">
                {counts.users}
              </div>
              <div className="stat-label">Users</div>
            </div>
            <div
              className="stat-card"
              role="status"
              aria-label={`Total jobs ${counts.jobs}`}
            >
              <div className="stat-value" data-testid="job-count">
                {counts.jobs}
              </div>
              <div className="stat-label">Jobs</div>
            </div>
          </div>
        </header>

        <nav aria-label="Primary">
          <div className="tabs">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "tab-btn active" : "tab-btn"
              }
              end
            >
              Users
            </NavLink>
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                isActive ? "tab-btn active" : "tab-btn"
              }
            >
              Jobs
            </NavLink>
            <NavLink
              to="/match"
              className={({ isActive }) =>
                isActive ? "tab-btn active" : "tab-btn"
              }
            >
              Match
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                isActive ? "tab-btn active" : "tab-btn"
              }
            >
              Search
            </NavLink>
            <NavLink
              to="/skills"
              className={({ isActive }) =>
                isActive ? "tab-btn active" : "tab-btn"
              }
            >
              Skills
            </NavLink>
            <NavLink
              to="/insights"
              className={({ isActive }) =>
                isActive ? "tab-btn active" : "tab-btn"
              }
            >
              Insights
            </NavLink>
          </div>
        </nav>

        <main id="main" tabIndex={-1}>
          <RouteTitle />
          <div
            aria-live="polite"
            aria-atomic="true"
            id="app-status"
            style={{
              position: "absolute",
              left: -9999,
              top: "auto",
              width: 1,
              height: 1,
              overflow: "hidden",
            }}
          ></div>
          <Routes>
            <Route path="/" element={<Users />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/match" element={<Match />} />
            <Route path="/search" element={<Search />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>

        <footer role="contentinfo">
          <p>Job Search Engine © {new Date().getFullYear()}</p>
        </footer>

        <Toast />
      </div>
    </Router>
  );
}

export default App;
