const Job = require("../models/job");
const User = require("../models/user");

/**
 * Matching Service
 * Handles job-user skill matching using set similarity metrics
 */
class MatcherService {
  /**
   * Calculate Jaccard similarity between two sets of skills
   * Jaccard similarity = |intersection| / |union|
   *
   * @param {Array} userSkills - Array of user skills
   * @param {Array} jobSkills - Array of job required skills
   * @returns {Number} - Similarity score between 0 and 1
   */
  calculateJaccardSimilarity(userSkills, jobSkills) {
    // Convert arrays to sets for easier operations
    const userSkillSet = new Set(userSkills);
    const jobSkillSet = new Set(jobSkills);

    // Calculate intersection size
    const intersection = new Set(
      [...userSkillSet].filter((skill) => jobSkillSet.has(skill))
    );

    // Calculate union size
    const union = new Set([...userSkillSet, ...jobSkillSet]);

    // Return Jaccard similarity coefficient
    return intersection.size / union.size;
  }

  /**
   * Calculate skill match score (simpler alternative)
   * Measures what percentage of job required skills the user has
   *
   * @param {Array} userSkills - Array of user skills
   * @param {Array} jobSkills - Array of job required skills
   * @returns {Number} - Match score between 0 and 1
   */
  calculateMatchScore(userSkills, jobSkills) {
    if (jobSkills.length === 0) return 0;

    const matchedSkills = jobSkills.filter((skill) =>
      userSkills.includes(skill)
    );
    return matchedSkills.length / jobSkills.length;
  }

  /**
   * Find the top N matching jobs for a user
   *
   * @param {String} userId - User ID to find matches for
   * @param {Number} limit - Maximum number of jobs to return
   * @param {String} algorithm - Matching algorithm to use ('jaccard' or 'simple')
   * @returns {Array} - Array of job objects with match scores
   */
  async findMatchesForUser(userId, limit = 10, algorithm = "jaccard") {
    try {
      // Get user from database
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Get all jobs
      const jobs = await Job.find({});

      // Calculate match scores for each job
      const jobsWithScores = jobs.map((job) => {
        const score =
          algorithm === "jaccard"
            ? this.calculateJaccardSimilarity(user.skills, job.requiredSkills)
            : this.calculateMatchScore(user.skills, job.requiredSkills);

        return {
          job,
          score,
        };
      });

      // Sort by score (descending) and take top N
      const topMatches = jobsWithScores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ job, score }) => ({
          job: {
            _id: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            requiredSkills: job.requiredSkills,
          },
          score,
        }));

      return topMatches;
    } catch (error) {
      console.error("Error finding matches:", error);
      throw error;
    }
  }
}

module.exports = new MatcherService();
