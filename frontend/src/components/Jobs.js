import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useToast } from "./Toast";
import Skeleton from "./Skeleton";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    skills: "",
    description: "",
  });
  const [editingJobId, setEditingJobId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch {
      showToast("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setJobData({
      ...jobData,
      [id.replace("job-", "")]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobData.title.trim() || !jobData.company.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    const submitData = {
      ...jobData,
      skills: jobData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (editingJobId) {
        await api.updateJob(editingJobId, submitData);
        showToast("Job updated successfully", "success");
      } else {
        await api.addJob(submitData);
        showToast("Job added successfully", "success");
      }
      setEditingJobId(null);
      setJobData({
        title: "",
        company: "",
        location: "",
        skills: "",
        description: "",
      });
      loadJobs();
    } catch {
      showToast(
        editingJobId ? "Failed to update job" : "Failed to add job",
        "error"
      );
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await api.deleteJob(jobId);
      showToast("Job deleted successfully", "success");
      loadJobs();
    } catch {
      showToast("Failed to delete job", "error");
    }
  };

  const startEdit = (job) => {
    setEditingJobId(job._id);
    setJobData({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      skills: (job.skills || []).join(", "),
      description: job.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingJobId(null);
    setJobData({
      title: "",
      company: "",
      location: "",
      skills: "",
      description: "",
    });
  };

  return (
    <section id="jobs" className="tab-content">
      <h2>Job Management</h2>

      <div className="card">
        <h3>{editingJobId ? "Edit Job" : "Add New Job"}</h3>
        <form
          id="add-job-form"
          onSubmit={handleSubmit}
          aria-label={editingJobId ? "Edit existing job" : "Add new job"}
        >
          <div className="form-group">
            <label htmlFor="job-title">Title:</label>
            <input
              type="text"
              id="job-title"
              value={jobData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="job-company">Company:</label>
            <input
              type="text"
              id="job-company"
              value={jobData.company}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="job-location">Location:</label>
            <input
              type="text"
              id="job-location"
              value={jobData.location}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="job-skills">
              Required Skills (comma-separated):
            </label>
            <input
              type="text"
              id="job-skills"
              placeholder="JavaScript, React, Node.js"
              value={jobData.skills}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="job-description">Description:</label>
            <textarea
              id="job-description"
              rows="4"
              value={jobData.description}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
                  <span
                    className="spinner-ring"
                    style={{ width: 16, height: 16, borderWidth: 3 }}
                  ></span>
                  {editingJobId ? "Saving..." : "Adding..."}
                </span>
              ) : editingJobId ? (
                "Save Changes"
              ) : (
                "Add Job"
              )}
            </button>
            {editingJobId && (
              <button
                type="button"
                className="btn outline"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Job List</h3>
        <button
          onClick={loadJobs}
          className="btn btn-small"
          disabled={loading}
          aria-disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        <div id="jobs-list" className="list-container">
          {loading ? (
            <div className="list-grid" aria-busy="true">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="list-item card" aria-hidden="true">
                  <Skeleton
                    height={20}
                    style={{ marginBottom: 10, width: "60%" }}
                  />
                  <Skeleton
                    height={14}
                    style={{ marginBottom: 6, width: "80%" }}
                  />
                  <Skeleton
                    height={12}
                    style={{ marginBottom: 6, width: "40%" }}
                  />
                  <Skeleton height={48} style={{ marginTop: 8 }} />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <p className="info-message">No jobs found</p>
          ) : (
            <div className="list-grid">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="list-item card"
                  tabIndex={0}
                  aria-label={`Job ${job.title} at ${job.company}`}
                >
                  <h4>{job.title}</h4>
                  <p>
                    <strong>Company:</strong> {job.company}
                  </p>
                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>
                  <p style={{ fontSize: 13 }}>
                    <strong>Description:</strong> {job.description}
                  </p>
                  <div className="skills-list">
                    {job.skills &&
                      job.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="btn btn-small secondary"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => startEdit(job)}
                      className="btn btn-small outline"
                    >
                      Edit
                    </button>
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

export default Jobs;
