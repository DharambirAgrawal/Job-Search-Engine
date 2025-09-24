import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Spinner from "./Spinner";
import Skeleton from "./Skeleton";
import { useToast } from "./Toast";

const Match = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch {
      showToast("Failed to load users", "error");
    }
  };

  const handleUserChange = (e) => setSelectedUser(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      showToast("Please select a user", "error");
      return;
    }

    setLoading(true);

    try {
      const data = await api.getMatches(selectedUser);
      setMatches(data);
    } catch {
      showToast("Failed to find matches", "error");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="match" className="tab-content">
      <h2>Find Job Matches</h2>

      <div className="card">
        <h3>Select User</h3>
        <form
          id="match-form"
          onSubmit={handleSubmit}
          aria-label="Find matches form"
        >
          <div className="form-group">
            <label htmlFor="match-user">User:</label>
            <select
              id="match-user"
              value={selectedUser}
              onChange={handleUserChange}
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Spinner size={16} /> Finding...
              </span>
            ) : (
              "Find Matches"
            )}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Matching Jobs</h3>
        <div id="match-results" className="list-container">
          {loading ? (
            <div className="list-grid" aria-busy="true">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="list-item card" aria-hidden="true">
                  <Skeleton
                    height={20}
                    style={{ marginBottom: 8, width: "60%" }}
                  />
                  <Skeleton
                    height={12}
                    style={{ marginBottom: 8, width: "40%" }}
                  />
                  <Skeleton
                    height={12}
                    style={{ marginBottom: 8, width: "30%" }}
                  />
                  <Skeleton height={40} style={{ marginTop: 8 }} />
                </div>
              ))}
            </div>
          ) : matches.length === 0 ? (
            <p className="info-message">
              No matches found or select a user to find matches
            </p>
          ) : (
            <div className="list-grid">
              {matches.map((job) => {
                const score = job.matchScore ? job.matchScore.toFixed(2) : 0;
                return (
                  <div
                    key={job._id}
                    className="list-item card"
                    tabIndex={0}
                    aria-label={`Job ${job.title} match score ${score}%`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <h4 style={{ marginBottom: 4 }}>{job.title}</h4>
                      <span
                        className="match-score-badge"
                        aria-label={`Match score ${score}%`}
                      >
                        {score}%
                      </span>
                    </div>
                    <p>
                      <strong>Company:</strong> {job.company}
                    </p>
                    <p>
                      <strong>Location:</strong> {job.location}
                    </p>
                    <div className="skills-list">
                      {job.skills &&
                        job.skills.map((skill, idx) => (
                          <span key={idx} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                    </div>
                    {job.missingSkills && job.missingSkills.length > 0 && (
                      <div className="suggestion-box" style={{ marginTop: 14 }}>
                        <h4>Skills to Learn:</h4>
                        <div className="skills-list">
                          {job.missingSkills.map((skill, idx) => (
                            <span key={idx} className="skill-tag suggestion">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Match;
