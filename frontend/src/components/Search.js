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
    } catch (error) {
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
        <form id="search-form" onSubmit={handleSubmit}>
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
            <div className="list-grid">
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
              No results found or enter a search query
            </p>
          ) : (
            <div className="list-grid">
              {searchResults.map((job) => (
                <div key={job._id} className="list-item card">
                  <h4>{job.title}</h4>
                  <p>
                    <strong>Company:</strong> {job.company}
                  </p>
                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>
                  <p>
                    <strong>Relevance:</strong>{" "}
                    <span className="match-score">
                      {job.relevance.toFixed(2)}%
                    </span>
                  </p>
                  <p>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Search;
