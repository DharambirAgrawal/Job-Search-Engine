import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Skeleton from "./Skeleton";
import Spinner from "./Spinner";
import { useToast } from "./Toast";

const Insights = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualUserSkills, setManualUserSkills] = useState("");
  const [manualJobSkills, setManualJobSkills] = useState("");
  const [manualJobTitle, setManualJobTitle] = useState("");
  const [manualCompany, setManualCompany] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [u, j] = await Promise.all([api.getUsers(), api.getJobs()]);
        setUsers(u || []);
        setJobs(j || []);
      } catch (e) {
        // optional
      }
    };
    load();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalysis(null);
    if (!manualMode && (!selectedUser || !selectedJob)) {
      showToast("Select a user and a job", "error");
      return;
    }
    if (manualMode && (!manualUserSkills.trim() || !manualJobSkills.trim())) {
      showToast("Enter both user and job skills", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = manualMode
        ? {
            userSkills: manualUserSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            jobSkills: manualJobSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            jobTitle: manualJobTitle || "Target Role",
            company: manualCompany || "",
          }
        : { userId: selectedUser, jobId: selectedJob };
      const data = await api.getJobFit(payload);
      setAnalysis(data);
    } catch (error) {
      showToast("Failed to generate analysis", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="insights" className="tab-content">
      <h2>AI Job Fit Insights</h2>
      <div className="card">
        <h3>Configure Analysis</h3>
        <form onSubmit={handleAnalyze}>
          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={manualMode}
                onChange={(e) => setManualMode(e.target.checked)}
              />
              Manual input mode
            </label>
          </div>
          {!manualMode && (
            <>
              <div className="form-group">
                <label>User:</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Select user</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Job:</label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                >
                  <option value="">Select job</option>
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} - {j.company}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {manualMode && (
            <div className="manual-grid" style={{ display: "grid", gap: 12 }}>
              <div className="form-group">
                <label>User Skills (comma-separated)</label>
                <input
                  value={manualUserSkills}
                  onChange={(e) => setManualUserSkills(e.target.value)}
                  placeholder="React, Node.js, Docker"
                />
              </div>
              <div className="form-group">
                <label>Job Skills (comma-separated)</label>
                <input
                  value={manualJobSkills}
                  onChange={(e) => setManualJobSkills(e.target.value)}
                  placeholder="React, TypeScript, AWS"
                />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  value={manualJobTitle}
                  onChange={(e) => setManualJobTitle(e.target.value)}
                  placeholder="Senior Frontend Engineer"
                />
              </div>
              <div className="form-group">
                <label>Company (optional)</label>
                <input
                  value={manualCompany}
                  onChange={(e) => setManualCompany(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
            </div>
          )}
          <button
            className="btn"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Spinner size={16} /> Analyzing...
              </span>
            ) : (
              "Analyze Fit"
            )}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Results</h3>
        {loading && (
          <div className="list-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="list-item card" aria-hidden="true">
                <Skeleton
                  height={18}
                  style={{ marginBottom: 8, width: "70%" }}
                />
                <Skeleton
                  height={12}
                  style={{ marginBottom: 6, width: "90%" }}
                />
                <Skeleton height={12} style={{ width: "60%" }} />
              </div>
            ))}
          </div>
        )}
        {!loading && !analysis && (
          <p className="info-message">Run an analysis to see insights.</p>
        )}
        {!loading && analysis && (
          <div className="analysis">
            <h4>Summary</h4>
            <p>{analysis.analysis.summary}</p>
            {analysis.analysis.pitch && (
              <div className="suggestion-box" style={{ marginTop: 16 }}>
                <h4>Personal Pitch</h4>
                <p style={{ fontSize: 14 }}>{analysis.analysis.pitch}</p>
              </div>
            )}
            <div className="list-grid" style={{ marginTop: 20 }}>
              <div className="list-item card">
                <h4>Strengths</h4>
                {(analysis.analysis.strengths || []).length === 0 && (
                  <p>No strengths detected.</p>
                )}
                <ul style={{ paddingLeft: 18 }}>
                  {(analysis.analysis.strengths || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="list-item card">
                <h4>Skill Gaps</h4>
                {(analysis.analysis.gaps || []).length === 0 && (
                  <p>No gaps detected.</p>
                )}
                <ul style={{ paddingLeft: 18 }}>
                  {(analysis.analysis.gaps || []).map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
              <div className="list-item card">
                <h4>Priority Skills</h4>
                {(analysis.analysis.prioritySkills || []).length === 0 && (
                  <p>No priorities.</p>
                )}
                <ul style={{ paddingLeft: 18 }}>
                  {(analysis.analysis.prioritySkills || []).map((p, i) => (
                    <li key={i}>
                      <strong>{p.skill}</strong> – {(p.impact * 100).toFixed(0)}
                      % impact
                      {p.reason && (
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {p.reason}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card" style={{ marginTop: 20 }}>
              <h4>Learning Plan</h4>
              {(analysis.analysis.learningPlan || []).length === 0 && (
                <p>No plan available.</p>
              )}
              <ol style={{ paddingLeft: 18 }}>
                {(analysis.analysis.learningPlan || []).map((step, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>
                    <strong>{step.step || step.focus}</strong> –{" "}
                    {step.focus && step.step ? step.focus : ""}
                    {step.rationale && (
                      <div style={{ fontSize: 12, color: "#555" }}>
                        {step.rationale}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
            <div
              className="meta"
              style={{ marginTop: 20, fontSize: 12, color: "#666" }}
            >
              <p>
                Compared <strong>{analysis.meta.userSkills.length}</strong> user
                skills to
                <strong> {analysis.meta.jobSkills.length}</strong> job skills
                for
                <strong> {analysis.meta.jobTitle}</strong>
                {analysis.meta.company && ` @ ${analysis.meta.company}`}
              </p>
              <p>
                Generated:{" "}
                {new Date(analysis.meta.generatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Insights;
