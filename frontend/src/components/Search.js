import React, { useState } from "react";
import { api } from "../services/api";
import Spinner from "./Spinner";
import Skeleton from "./Skeleton";
import { useToast } from "./Toast";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      showToast("Please enter a search term", "error");
      return;
    }
    setLoading(true);
    try {
      const data = await api.searchJobs(searchQuery);
      setSearchResults(data);
    } catch {
      showToast("Failed to search jobs", "error");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="search" className="tab-content">
      <h2>Search Jobs</h2>
      <div className="card">
        <h3>Search</h3>
        <form
          id="search-form"
          onSubmit={handleSubmit}
          role="search"
          aria-label="Job search form"
        >
          <div className="form-group">
            <label htmlFor="search-query">Search Query:</label>
            <input
              type="text"
              id="search-query"
              placeholder="Job title, skills, company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Spinner size={16} /> Searching...
              </span>
            ) : (
              "Search"
            )}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Search Results</h3>
        <div id="search-results" className="list-container">
          {loading ? (
            <div className="list-grid" aria-busy="true">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="list-item card" aria-hidden="true">
                  <Skeleton
                    height={20}
                    style={{ marginBottom: 8, width: "70%" }}
                  />
                  <Skeleton
                    height={12}
                    style={{ marginBottom: 6, width: "50%" }}
                  />
                  <Skeleton
                    height={12}
                    style={{ marginBottom: 6, width: "30%" }}
                  />
                  <Skeleton height={40} style={{ marginTop: 8 }} />
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <p className="info-message">
              No results yet. Try searching for a role or technology.
            </p>
          ) : (
            <div className="list-grid">
              {searchResults.map((job) => {
                const relevancePct = job.relevance
                  ? job.relevance.toFixed(2)
                  : 0;
                return (
                  <div
                    key={job._id}
                    className="list-item card"
                    tabIndex={0}
                    aria-label={`Job ${job.title} relevance ${relevancePct}%`}
                  >
                    <h4>{job.title}</h4>
                    <p>
                      <strong>Company:</strong> {job.company}
                    </p>
                    <p>
                      <strong>Location:</strong> {job.location}
                    </p>
                    <p style={{ marginBottom: 4 }}>
                      <strong>Relevance:</strong>{" "}
                      <span className="match-score">{relevancePct}%</span>
                    </p>
                    <div className="relevance-wrapper">
                      <div className="relevance-bar-track" aria-hidden="true">
                        <div
                          className="relevance-bar-fill"
                          style={{ "--value": `${relevancePct}%` }}
                        ></div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, marginTop: 8 }}>
                      <strong>Description:</strong> {job.description}
                    </p>
                    <div className="skills-list">
                      {job.skills &&
                        job.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                    </div>
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

export default Search;
