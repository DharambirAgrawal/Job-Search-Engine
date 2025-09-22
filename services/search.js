const Job = require("../models/job");

/**
 * Search Service
 * Handles job search functionality with basic inverted index implementation
 */
class SearchService {
  constructor() {
    this.invertedIndex = {};
    this.jobsCache = {};
    this.isIndexBuilt = false;
  }

  /**
   * Build an inverted index for faster searching
   * Maps each token to a list of job IDs that contain it
   */
  async buildInvertedIndex() {
    try {
      // Clear existing index
      this.invertedIndex = {};
      this.jobsCache = {};

      // Get all jobs
      const jobs = await Job.find({});

      // Process each job
      jobs.forEach((job) => {
        // Store job in cache for quick lookup
        this.jobsCache[job._id] = job;

        // Tokenize and process the job title, description, and company
        const titleTokens = this.tokenize(job.title);
        const descriptionTokens = this.tokenize(job.description);
        const companyTokens = this.tokenize(job.company);
        const skillTokens = job.requiredSkills.flatMap((skill) =>
          this.tokenize(skill)
        );

        // Combine all tokens
        const allTokens = [
          ...new Set([
            ...titleTokens,
            ...descriptionTokens,
            ...companyTokens,
            ...skillTokens,
          ]),
        ];

        // Add job ID to inverted index for each token
        allTokens.forEach((token) => {
          if (!this.invertedIndex[token]) {
            this.invertedIndex[token] = new Set();
          }
          this.invertedIndex[token].add(job._id);
        });
      });

      this.isIndexBuilt = true;
      console.log(
        `Inverted index built with ${
          Object.keys(this.invertedIndex).length
        } tokens`
      );
    } catch (error) {
      console.error("Error building inverted index:", error);
      throw error;
    }
  }

  /**
   * Tokenize a string into meaningful words
   *
   * @param {String} text - Text to tokenize
   * @returns {Array} - Array of tokens
   */
  tokenize(text) {
    if (!text) return [];

    // Convert to lowercase and split by non-alphanumeric characters
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 2); // Filter out tokens that are too short
  }

  /**
   * Search for jobs using the inverted index
   *
   * @param {String} query - Search query
   * @param {Number} limit - Maximum number of results
   * @returns {Array} - Array of matching job objects
   */
  async search(query, limit = 10) {
    try {
      // Force rebuild the index every time to ensure fresh data
      await this.buildInvertedIndex();

      // Tokenize the query
      const queryTokens = this.tokenize(query);

      if (queryTokens.length === 0) {
        return [];
      }

      // Get matching job IDs for each token
      const tokenMatches = queryTokens.map((token) =>
        this.invertedIndex[token] ? [...this.invertedIndex[token]] : []
      );

      // Count occurrences of each job ID across all tokens
      const jobScores = {};

      tokenMatches.flat().forEach((jobId) => {
        jobScores[jobId] = (jobScores[jobId] || 0) + 1;
      });

      // Sort by score (descending) and take top N
      const topMatchIds = Object.entries(jobScores)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, limit)
        .map(([jobId]) => jobId);

      // Convert IDs back to job objects
      const matches = topMatchIds.map((jobId) => this.jobsCache[jobId]);

      return matches.filter(Boolean); // Filter out any null values
    } catch (error) {
      console.error("Error searching jobs:", error);

      // Fallback to database search if inverted index fails
      console.log("Falling back to database search");
      return this.fallbackSearch(query, limit);
    }
  }

  /**
   * Fallback search method using text search utility
   *
   * @param {String} query - Search query
   * @param {Number} limit - Maximum number of results
   * @returns {Array} - Array of matching job objects
   */
  async fallbackSearch(query, limit = 10) {
    try {
      const { textSearch } = require("../utils/search-utils");
      const jobs = await textSearch(query, limit);
      return jobs;
    } catch (error) {
      console.error("Error in fallback search:", error);
      throw error;
    }
  }

  /**
   * Refresh the inverted index
   * Should be called when jobs are added, updated, or removed
   */
  async refreshIndex() {
    this.isIndexBuilt = false;
    await this.buildInvertedIndex();
  }
}

module.exports = new SearchService();
