import React, { useState } from "react";
import { api } from "../services/api";
import { useToast } from "./Toast";
import "./Skills.css";

const Skills = () => {
  const [recommendSkills, setRecommendSkills] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [fromSkill, setFromSkill] = useState("");
  const [toSkill, setToSkill] = useState("");
  const [skillPath, setSkillPath] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingPath, setLoadingPath] = useState(false);
  const { showToast } = useToast();

  const handleRecommendSubmit = async (e) => {
    e.preventDefault();

    if (!recommendSkills.trim()) {
      showToast("Please enter at least one skill", "error");
      return;
    }

    setLoadingRecommendations(true);

    try {
      const data = await api.getSkillRecommendations(recommendSkills, jobTitle);
      setRecommendations(data);
    } catch (error) {
      showToast("Failed to get skill recommendations", "error");
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handlePathSubmit = async (e) => {
    e.preventDefault();

    if (!fromSkill.trim() || !toSkill.trim()) {
      showToast("Please enter both skills", "error");
      return;
    }

    setLoadingPath(true);

    try {
      const data = await api.getSkillPath(fromSkill, toSkill);
      setSkillPath(data.path || []);
    } catch (error) {
      showToast("Failed to find skill path", "error");
      setSkillPath([]);
    } finally {
      setLoadingPath(false);
    }
  };

  const addRecommendedSkill = (skill) => {
    const currentSkills = recommendSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (!currentSkills.includes(skill)) {
      const newSkills = [...currentSkills, skill];
      setRecommendSkills(newSkills.join(", "));
    }
  };

  return (
    <section id="skills" className="tab-content">
      <h2>Skills Analysis</h2>

      <div className="card">
        <h3>Get Skill Recommendations</h3>
        <form id="skill-recommend-form" onSubmit={handleRecommendSubmit}>
          <div className="form-group">
            <label htmlFor="recommend-skills">Skills (comma-separated):</label>
            <input
              type="text"
              id="recommend-skills"
              placeholder="JavaScript, React, Node.js"
              value={recommendSkills}
              onChange={(e) => setRecommendSkills(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="job-title">Target Job Title (optional):</label>
            <input
              type="text"
              id="job-title"
              placeholder="Full Stack Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <button type="submit" className="btn">
            Get Recommendations
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Find Skill Path</h3>
        <form id="skill-path-form" onSubmit={handlePathSubmit}>
          <div className="form-group">
            <label htmlFor="from-skill">From Skill:</label>
            <input
              type="text"
              id="from-skill"
              placeholder="JavaScript"
              value={fromSkill}
              onChange={(e) => setFromSkill(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="to-skill">To Skill:</label>
            <input
              type="text"
              id="to-skill"
              placeholder="React"
              value={toSkill}
              onChange={(e) => setToSkill(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">
            Find Path
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Results</h3>
        <div id="skill-results" className="list-container">
          {loadingRecommendations && (
            <p className="loading">Getting recommendations...</p>
          )}
          {loadingPath && <p className="loading">Finding skill path...</p>}

          {!loadingRecommendations && recommendations.length > 0 && (
            <div className="list-item">
              <h4>Recommended Skills</h4>
              <div className="skills-list">
                {recommendations.map((rec, index) => (
                  <div key={index} className="skill-recommendation">
                    <span
                      className="skill-tag suggestion"
                      onClick={() => addRecommendedSkill(rec.skill)}
                    >
                      {rec.skill}
                    </span>
                    {rec.explanation && (
                      <p className="skill-explanation">{rec.explanation}</p>
                    )}
                    {rec.relevance && (
                      <div className="skill-relevance">
                        <div
                          className="relevance-bar"
                          style={{
                            width: `${Math.round(rec.relevance * 100)}%`,
                          }}
                        ></div>
                        <span className="relevance-text">
                          {Math.round(rec.relevance * 100)}% relevance
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: "10px", fontSize: "14px" }}>
                Click on a skill to add it to your list
              </p>
            </div>
          )}

          {!loadingPath && skillPath.length > 0 && (
            <div className="list-item">
              <h4>Skill Learning Path</h4>
              <div className="skill-path">
                {skillPath.map((pathItem, index) => (
                  <div key={index} className="path-item">
                    <div className="path-step">
                      <span className="step-number">{index + 1}</span>
                      <span className="skill-tag">{pathItem.skill}</span>
                    </div>
                    {pathItem.explanation && (
                      <p className="path-explanation">{pathItem.explanation}</p>
                    )}
                    {pathItem.difficulty && (
                      <div className="difficulty-indicator">
                        <span>Difficulty: </span>
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`difficulty-star ${
                              i < pathItem.difficulty ? "filled" : ""
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                    {index < skillPath.length - 1 && (
                      <div className="path-arrow">↓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loadingRecommendations &&
            !loadingPath &&
            recommendations.length === 0 &&
            skillPath.length === 0 && (
              <p className="info-message">
                No results yet. Use the forms above to get skill recommendations
                or find a skill path.
              </p>
            )}
        </div>
      </div>
    </section>
  );
};

export default Skills;
