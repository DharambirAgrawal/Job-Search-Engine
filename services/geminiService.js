/**
 * Gemini API Service
 * Handles interactions with Google's Gemini AI model for skill recommendations and insights
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

class GeminiService {
  constructor() {
    // Initialize the Gemini API client with the API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn(
        "GEMINI_API_KEY not found in environment variables. AI-enhanced features will not be available."
      );
      this.isAvailable = false;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      this.isAvailable = true;
    } catch (error) {
      console.error("Error initializing Gemini API:", error);
      this.isAvailable = false;
    }
  }

  /**
   * Get enhanced skill recommendations using AI
   *
   * @param {Array} userSkills - User's current skills
   * @param {Number} limit - Maximum number of recommendations
   * @param {String} jobTitle - Optional job title to target recommendations
   * @returns {Promise<Array>} - Array of recommended skills with explanations
   */
  async getEnhancedRecommendations(userSkills, limit = 5, jobTitle = "") {
    if (!this.isAvailable) {
      return null; // AI service not available
    }

    try {
      const prompt = this._buildRecommendationPrompt(
        userSkills,
        limit,
        jobTitle
      );
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this._parseRecommendationsResponse(text);
    } catch (error) {
      console.error("Error getting AI skill recommendations:", error);
      return null;
    }
  }

  /**
   * Get an AI-enhanced learning path between two skills
   *
   * @param {String} fromSkill - Starting skill
   * @param {String} toSkill - Target skill
   * @returns {Promise<Array>} - Array of steps in the learning path with explanations
   */
  async getEnhancedLearningPath(fromSkill, toSkill) {
    if (!this.isAvailable) {
      return null; // AI service not available
    }

    try {
      const prompt = this._buildLearningPathPrompt(fromSkill, toSkill);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this._parseLearningPathResponse(text);
    } catch (error) {
      console.error("Error getting AI learning path:", error);
      return null;
    }
  }

  /**
   * Provide AI analysis for how well a user's skills fit a specific job
   * Returns structured JSON with: summary, strengths, gaps, learningPlan, pitch
   *
   * @param {Array} userSkills
   * @param {Array} jobSkills
   * @param {String} jobTitle
   * @param {String} company
   * @returns {Promise<Object|null>}
   */
  async getJobFitAnalysis(userSkills, jobSkills, jobTitle, company = "") {
    if (!this.isAvailable) return null;
    try {
      const prompt = this._buildJobFitPrompt(
        userSkills,
        jobSkills,
        jobTitle,
        company
      );
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return this._parseJobFitResponse(text);
    } catch (error) {
      console.error("Error getting AI job fit analysis:", error);
      return null;
    }
  }

  /**
   * Build a prompt for skill recommendations
   *
   * @private
   * @param {Array} userSkills - User's current skills
   * @param {Number} limit - Maximum number of recommendations
   * @param {String} jobTitle - Optional job title to target recommendations
   * @returns {String} - Formatted prompt for the AI model
   */
  _buildRecommendationPrompt(userSkills, limit, jobTitle) {
    let prompt = `You are a career advisor specialized in technical skills development. `;

    prompt += `Based on the following skills a person already knows: ${userSkills.join(
      ", "
    )}`;

    if (jobTitle) {
      prompt += `, and their interest in becoming a ${jobTitle},`;
    }

    prompt += ` recommend the top ${limit} skills they should learn next to advance their career.`;
    prompt += ` For each skill, provide a brief explanation of why it's valuable and how it relates to their existing skills.`;
    prompt += ` Format your response as a JSON array with objects containing 'skill', 'explanation', and 'relevance' (a number from 0-1) properties.`;

    return prompt;
  }

  /**
   * Build a prompt for learning path
   *
   * @private
   * @param {String} fromSkill - Starting skill
   * @param {String} toSkill - Target skill
   * @returns {String} - Formatted prompt for the AI model
   */
  _buildLearningPathPrompt(fromSkill, toSkill) {
    let prompt = `You are a technical education expert. `;

    prompt += `Create a learning path for someone who knows ${fromSkill} and wants to learn ${toSkill}. `;
    prompt += `Provide a step-by-step path of skills or concepts they should learn in between, in the most logical progression order. `;
    prompt += `For each step, include what to learn and a brief explanation of why it's an important stepping stone. `;
    prompt += `Format your response as a JSON array with objects containing 'skill', 'explanation', and 'difficulty' (a number from 1-5) properties.`;

    return prompt;
  }

  /**
   * Parse the AI response for skill recommendations
   *
   * @private
   * @param {String} response - Raw text response from the AI model
   * @returns {Array} - Parsed recommendations
   */
  _parseRecommendationsResponse(response) {
    try {
      // Extract JSON array from response (the AI might include additional text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to simpler parsing if JSON extraction fails
      return response
        .split("\n")
        .filter(
          (line) => line.trim().startsWith("-") || line.trim().startsWith("*")
        )
        .map((line) => {
          const skill = line
            .replace(/^[-*]\s*/, "")
            .split(":")[0]
            .trim();
          const explanation = line.includes(":")
            ? line.split(":").slice(1).join(":").trim()
            : "";
          return { skill, explanation, relevance: 0.7 };
        });
    } catch (error) {
      console.error("Error parsing AI recommendations:", error);
      return [];
    }
  }

  /**
   * Build a prompt for job fit analysis
   * @private
   */
  _buildJobFitPrompt(userSkills, jobSkills, jobTitle, company) {
    return `You are an expert technical career coach.
Given a candidate with skills: ${userSkills.join(", ") || "(none)"}
And a job titled: ${jobTitle}${
      company ? ` at ${company}` : ""
    } requiring skills: ${jobSkills.join(", ") || "(none)"}
Provide a concise JSON object ONLY with keys: summary (string), strengths (array of strings), gaps (array of strings), learningPlan (array of objects with step, focus, rationale), pitch (string tailored short personal pitch), prioritySkills (array of objects with skill, impact (0-1), reason).
Keep items actionable, avoid generic fluff. JSON only, no markdown.`;
  }

  /**
   * Parse job fit response
   * @private
   */
  _parseJobFitResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Error parsing job fit response", e);
    }
    return {
      summary: "AI analysis unavailable.",
      strengths: [],
      gaps: [],
      learningPlan: [],
      pitch: "",
      prioritySkills: [],
    };
  }

  /**
   * Parse the AI response for learning path
   *
   * @private
   * @param {String} response - Raw text response from the AI model
   * @returns {Array} - Parsed learning path
   */
  _parseLearningPathResponse(response) {
    try {
      // Extract JSON array from response (the AI might include additional text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to simpler parsing if JSON extraction fails
      return response
        .split("\n")
        .filter(
          (line) =>
            line.trim().startsWith("-") ||
            line.trim().startsWith("*") ||
            /^\d+\./.test(line.trim())
        )
        .map((line, index) => {
          const cleanLine = line.replace(/^[-*\d.]\s*/, "");
          const skill = cleanLine.split(":")[0].trim();
          const explanation = cleanLine.includes(":")
            ? cleanLine.split(":").slice(1).join(":").trim()
            : "";
          return {
            skill,
            explanation,
            difficulty: Math.min(Math.floor(index / 2) + 1, 5),
          };
        });
    } catch (error) {
      console.error("Error parsing AI learning path:", error);
      return [];
    }
  }
}

module.exports = new GeminiService();
