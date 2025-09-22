import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import "../styles/App.css";

// Import components
import Users from "./Users";
import Jobs from "./Jobs";
import Match from "./Match";
import Search from "./Search";
import Skills from "./Skills";
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
    };
    document.title = titleMap[path] || "Job Search Engine";
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      <div className="container">
        <header>
          <h1>Job Search Engine</h1>
          <p>A skill-based job matching system</p>
        </header>

        <nav>
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
          </div>
        </nav>

        <main>
          <RouteTitle />
          <div aria-live="polite" aria-atomic="true" id="app-status" style={{position:'absolute', left:-9999, top:'auto', width:1, height:1, overflow:'hidden'}}></div>
          <Routes>
            <Route path="/" element={<Users />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/match" element={<Match />} />
            <Route path="/search" element={<Search />} />
            <Route path="/skills" element={<Skills />} />
          </Routes>
        </main>

        <footer>
          <p>Job Search Engine © {new Date().getFullYear()}</p>
        </footer>

        <Toast />
      </div>
    </Router>
  );
}

export default App;
