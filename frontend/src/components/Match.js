import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Spinner from "./Spinner";
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
    } catch (error) {
      showToast("Failed to load users", "error");
    }
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

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
    } catch (error) {
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
        <form id="match-form" onSubmit={handleSubmit}>
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
          <button type="submit" className="btn" disabled={loading} aria-busy={loading}>
            {loading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
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
            <p className="loading">Finding matches...</p>
          ) : matches.length === 0 ? (
            <p className="info-message">
              No matches found or select a user to find matches
            </p>
          ) : (
            matches.map((job) => (
              <div key={job._id} className="list-item">
                <h4>{job.title}</h4>
                <p>
                  <strong>Company:</strong> {job.company}
                </p>
                <p>
                  <strong>Match Score:</strong>{" "}
                  <span className="match-score">
                    {job.matchScore.toFixed(2)}%
                  </span>
                </p>
                <p>
                  <strong>Location:</strong> {job.location}
                </p>
                <div className="skills-list">
                  {job.skills &&
                    job.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                </div>
                {job.missingSkills && job.missingSkills.length > 0 && (
                  <div className="suggestion-box">
                    <h4>Skills to Learn:</h4>
                    <div className="skills-list">
                      {job.missingSkills.map((skill, index) => (
                        <span key={index} className="skill-tag suggestion">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Match;
