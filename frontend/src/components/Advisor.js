import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useToast } from "./Toast";
import Spinner from "./Spinner";
import Skeleton from "./Skeleton";

const Advisor = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [useAI, setUseAI] = useState(true);
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const j = await api.getJobs();
        setJobs(j || []);
      } catch {}
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile && !resumeText && !jobDescription && !jobId) {
      showToast("Provide a resume (file/text) and/or job info", "error");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await api.analyzeResume({
        file: resumeFile,
        jobId,
        jobDescription,
        useAI,
        resumeText: resumeText || undefined,
      });
      setResult(data);
      if (data.ai?.available) showToast("AI analysis generated", "success");
      else showToast("Baseline analysis ready", "success");
    } catch (err) {
      showToast("Analysis failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="advisor" className="tab-content">
      <h2>Resume / Job Advisor</h2>
      <div className="card">
        <h3>Upload & Compare</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label>Resume (PDF)</label>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
              {resumeFile && (
                <button
                  type="button"
                  className="btn btn-small outline"
                  onClick={() => setResumeFile(null)}
                >
                  Remove
                </button>
              )}
            </div>
            {resumeFile && (
              <small
                style={{
                  display: "block",
                  marginTop: 4,
                  color: "var(--text-light)",
                }}
              >
                {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
              </small>
            )}
          </div>
          <div className="form-group">
            <label>Or Paste Resume Text (optional)</label>
            <textarea
              rows={5}
              placeholder="Paste raw resume text here if no PDF"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Existing Job</label>
            <select value={jobId} onChange={(e) => setJobId(e.target.value)}>
              <option value="">-- Select Job (optional) --</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} - {j.company}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Or Paste Job Description</label>
            <textarea
              rows={5}
              placeholder="Paste job description here"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
          </div>
          <div
            className="form-group"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <input
              type="checkbox"
              id="use-ai"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
            />
            <label htmlFor="use-ai" style={{ margin: 0 }}>
              Use AI enhancement (if available) ✓
            </label>
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Spinner size={16} /> Analyzing...
              </span>
            ) : (
              "Analyze"
            )}
          </button>
        </form>
      </div>
      <div className="card">
        <h3>Results</h3>
        {loading && (
          <div className="list-grid" aria-busy="true">
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
        {!loading && !result && (
          <p className="info-message">
            Upload a resume and optionally choose or paste a job to compare.
          </p>
        )}
        {!loading && result && (
          <div className="fade-in">
            <h4>Baseline Comparison</h4>
            <div
              style={{
                fontSize: 13,
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: 6,
              }}
            >
              <div>
                Match Score:{" "}
                {result.baseline.matchScore !== null ? (
                  <span className="match-score">
                    {result.baseline.matchScore}%
                  </span>
                ) : (
                  "N/A"
                )}
              </div>
              {result.baseline.inferredSeniority && (
                <div>
                  Inferred Seniority:{" "}
                  <strong>{result.baseline.inferredSeniority}</strong>
                </div>
              )}
              <div>Resume Tokens: {result.extracted.resumeTokenCount}</div>
              <div>Job Tokens: {result.extracted.jobTokenCount}</div>
            </div>
            <div className="list-grid" style={{ marginTop: 12 }}>
              <div className="list-item card">
                <h4>Overlap</h4>
                {result.baseline.overlap.length ? (
                  <div className="skills-list">
                    {result.baseline.overlap.map((s) => (
                      <span key={s} className="skill-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No overlap</p>
                )}
              </div>
              <div className="list-item card">
                <h4>Missing</h4>
                {result.baseline.missing.length ? (
                  <div className="skills-list">
                    {result.baseline.missing.map((s) => (
                      <span key={s} className="skill-tag suggestion">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>None</p>
                )}
              </div>
              <div className="list-item card">
                <h4>Extra</h4>
                {result.baseline.extra.length ? (
                  <div className="skills-list">
                    {result.baseline.extra.map((s) => (
                      <span key={s} className="skill-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>None</p>
                )}
              </div>
            </div>
            <div className="card" style={{ marginTop: 18 }}>
              <h4>Top Resume Terms</h4>
              {result.baseline.topResumeTerms &&
              result.baseline.topResumeTerms.length ? (
                <ul style={{ paddingLeft: 18, fontSize: 13 }}>
                  {result.baseline.topResumeTerms.map((t) => (
                    <li key={t.term}>
                      <strong>{t.term}</strong> ×{t.count}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 13 }}>Not enough repetition detected.</p>
              )}
            </div>
            <div className="card" style={{ marginTop: 18 }}>
              <h4>Missing Skill Mentions</h4>
              {result.baseline.missingMentioned &&
              result.baseline.missingMentioned.length ? (
                <ul style={{ paddingLeft: 18, fontSize: 13 }}>
                  {result.baseline.missingMentioned.map((m) => (
                    <li key={m.skill}>
                      {m.skill} –{" "}
                      {m.mentioned ? "Partially referenced" : "Not mentioned"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 13 }}>
                  No missing skills list available.
                </p>
              )}
            </div>
            <div className="card" style={{ marginTop: 18 }}>
              <h4>Suggestions</h4>
              {result.baseline.suggestions &&
              result.baseline.suggestions.length ? (
                <ul style={{ paddingLeft: 18, fontSize: 13 }}>
                  {result.baseline.suggestions.map((s, i) => (
                    <li key={i}>
                      <strong>{s.type}:</strong> {s.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 13 }}>No suggestions generated.</p>
              )}
            </div>
            {result.ai && (
              <div className="card" style={{ marginTop: 20 }}>
                <h4>AI Insights {result.ai.available ? "✓" : "✗"}</h4>
                {!result.ai.available && (
                  <p style={{ fontSize: 13 }}>{result.ai.message}</p>
                )}
                {result.ai.available && (
                  <>
                    <p style={{ fontSize: 14 }}>{result.ai.analysis.summary}</p>
                    <div className="list-grid" style={{ marginTop: 14 }}>
                      <div className="list-item card">
                        <h4>Strengths</h4>
                        <ul style={{ paddingLeft: 18 }}>
                          {(result.ai.analysis.strengths || []).map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="list-item card">
                        <h4>Gaps</h4>
                        <ul style={{ paddingLeft: 18 }}>
                          {(result.ai.analysis.gaps || []).map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="list-item card">
                        <h4>Priority Skills</h4>
                        <ul style={{ paddingLeft: 18 }}>
                          {(result.ai.analysis.prioritySkills || []).map(
                            (p, i) => (
                              <li key={i}>
                                <strong>{p.skill}</strong>{" "}
                                {(p.impact * 100).toFixed(0)}%
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text-light)",
                                  }}
                                >
                                  {p.reason}
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                    {(result.ai.analysis.learningPlan || []).length > 0 && (
                      <div className="card" style={{ marginTop: 18 }}>
                        <h4>Learning Plan</h4>
                        <ol style={{ paddingLeft: 18 }}>
                          {result.ai.analysis.learningPlan.map((l, i) => (
                            <li key={i}>
                              <strong>{l.step || l.focus}</strong>{" "}
                              {l.focus && l.step ? "– " + l.focus : ""}
                              {l.rationale && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text-light)",
                                  }}
                                >
                                  {l.rationale}
                                </div>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Advisor;
