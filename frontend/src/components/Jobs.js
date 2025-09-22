import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useToast } from "./Toast";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch (error) {
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
        .map((skill) => skill.trim())
        .filter((skill) => skill),
    };

    try {
      if (editingJobId) {
        await api.updateJob(editingJobId, submitData);
        showToast("Job updated successfully", "success");
        setEditingJobId(null);
      } else {
        await api.addJob(submitData);
        showToast("Job added successfully", "success");
      }
      setJobData({
        title: "",
        company: "",
        location: "",
        skills: "",
        description: "",
      });
      loadJobs();
    } catch (error) {
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
    } catch (error) {
      showToast("Failed to delete job", "error");
    }
  };

  return (
    <section id="jobs" className="tab-content">
      <h2>Job Management</h2>

      <div className="card">
        <h3>Add New Job</h3>
        <form id="add-job-form" onSubmit={handleSubmit}>
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
          <button type="submit" className="btn" disabled={loading} aria-busy={loading}>
            {loading ? (
              <>
                <span className="btn-inline">
                  Adding...
                </span>
              </>
            ) : (
              "Add Job"
            )}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Job List</h3>
        <button onClick={loadJobs} className="btn btn-small" disabled={loading} aria-disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        <div id="jobs-list" className="list-container">
          {loading ? (
            <p className="loading">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="info-message">No jobs found</p>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="list-item">
                <h4>{job.title}</h4>
                <p>
                  <strong>Company:</strong> {job.company}
                </p>
                <p>
                  <strong>Location:</strong> {job.location}
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
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="btn btn-small"
                    style={{ marginRight: "8px" }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      // populate form for editing
                      setEditingJobId(job._id);
                      setJobData({
                        title: job.title || "",
                        company: job.company || "",
                        location: job.location || "",
                        skills: (job.skills || []).join(", "),
                        description: job.description || "",
                      });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="btn btn-small"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Jobs;
