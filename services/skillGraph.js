/**
 * Skill Graph Service
 * Handles skill relationships and recommendations using a directed graph
 * Now enhanced with Gemini AI for better recommendations
 */
const geminiService = require("./geminiService");

class SkillGraphService {
  constructor() {
    // Initialize graph as an adjacency list
    this.skillGraph = {};

    // Store skill metadata
    this.skillMetadata = {};

    // Initialize with some common skill relationships
    this.initializeDefaultGraph();

    // Check if AI service is available
    this.hasAICapabilities = geminiService.isAvailable;
  }

  /**
   * Initialize the graph with common skill relationships
   */
  initializeDefaultGraph() {
    // Web Development skill relationships
    this.addSkillRelationship("HTML", "CSS", 0.9);
    this.addSkillRelationship("CSS", "SASS", 0.7);
    this.addSkillRelationship("CSS", "LESS", 0.7);
    this.addSkillRelationship("JavaScript", "TypeScript", 0.8);
    this.addSkillRelationship("JavaScript", "React", 0.7);
    this.addSkillRelationship("JavaScript", "Vue.js", 0.7);
    this.addSkillRelationship("JavaScript", "Angular", 0.7);
    this.addSkillRelationship("JavaScript", "Node.js", 0.6);
    this.addSkillRelationship("TypeScript", "Angular", 0.8);
    this.addSkillRelationship("React", "Redux", 0.8);
    this.addSkillRelationship("Vue.js", "Vuex", 0.8);

    // Backend Development
    this.addSkillRelationship("Node.js", "Express", 0.9);
    this.addSkillRelationship("Python", "Django", 0.7);
    this.addSkillRelationship("Python", "Flask", 0.7);
    this.addSkillRelationship("Ruby", "Rails", 0.9);
    this.addSkillRelationship("Java", "Spring", 0.8);
    this.addSkillRelationship("C#", ".NET", 0.9);

    // Database skills
    this.addSkillRelationship("SQL", "MySQL", 0.8);
    this.addSkillRelationship("SQL", "PostgreSQL", 0.8);
    this.addSkillRelationship("NoSQL", "MongoDB", 0.8);
    this.addSkillRelationship("NoSQL", "Redis", 0.7);

    // DevOps
    this.addSkillRelationship("Linux", "Bash", 0.8);
    this.addSkillRelationship("Docker", "Kubernetes", 0.7);
    this.addSkillRelationship("AWS", "Azure", 0.6);
    this.addSkillRelationship("AWS", "GCP", 0.6);

    // Add metadata for some skills
    this.addSkillMetadata("React", {
      category: "Frontend",
      popularity: 0.9,
      description: "A JavaScript library for building user interfaces",
    });

    this.addSkillMetadata("Node.js", {
      category: "Backend",
      popularity: 0.85,
      description: "JavaScript runtime built on Chrome's V8 JavaScript engine",
    });
  }

  /**
   * Add a directed relationship between two skills with a weight
   *
   * @param {String} fromSkill - Source skill
   * @param {String} toSkill - Target skill
   * @param {Number} weight - Relationship strength (0-1)
   */
  addSkillRelationship(fromSkill, toSkill, weight = 0.5) {
    // Initialize nodes if they don't exist
    if (!this.skillGraph[fromSkill]) {
      this.skillGraph[fromSkill] = [];
    }

    if (!this.skillGraph[toSkill]) {
      this.skillGraph[toSkill] = [];
    }

    // Add directed edge
    this.skillGraph[fromSkill].push({
      skill: toSkill,
      weight,
    });

    // Add reverse edge with slightly lower weight
    this.skillGraph[toSkill].push({
      skill: fromSkill,
      weight: weight * 0.8, // Relationship is weaker in reverse
    });
  }

  /**
   * Add metadata for a skill
   *
   * @param {String} skill - Skill name
   * @param {Object} metadata - Skill metadata
   */
  addSkillMetadata(skill, metadata) {
    this.skillMetadata[skill] = metadata;
  }

  /**
   * Get all skills in the graph
   *
   * @returns {Array} - Array of skill names
   */
  getAllSkills() {
    return Object.keys(this.skillGraph);
  }

  /**
   * Get the most common skills in the graph (skills with most connections)
   *
   * @param {Number} limit - Maximum number of skills to return
   * @returns {Array} - Array of common skill names
   */
  getCommonSkills(limit = 10) {
    // Count connections for each skill
    const skillConnections = {};

    Object.entries(this.skillGraph).forEach(([skill, connections]) => {
      skillConnections[skill] = connections.length;
    });

    // Sort by number of connections and return top skills
    return Object.entries(skillConnections)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([skill]) => skill);
  }

  /**
   * Get related skills for a given skill
   *
   * @param {String} skill - Skill to find related skills for
   * @param {Number} minWeight - Minimum relationship weight
   * @returns {Array} - Array of related skills with weights
   */
  getRelatedSkills(skill, minWeight = 0) {
    if (!this.skillGraph[skill]) {
      return [];
    }

    return this.skillGraph[skill]
      .filter((relation) => relation.weight >= minWeight)
      .sort((a, b) => b.weight - a.weight);
  }

  /**
   * Find upskilling path between two skills
   * Enhanced with AI-generated learning path when available
   *
   * @param {String} currentSkill - Starting skill
   * @param {String} targetSkill - Target skill
   * @returns {Promise<Array|null>} - Path of skills or null if no path exists
   */
  async findUpskillingPath(currentSkill, targetSkill) {
    // Try to get AI-enhanced learning path first
    if (this.hasAICapabilities) {
      try {
        const aiPath = await geminiService.getEnhancedLearningPath(
          currentSkill,
          targetSkill
        );

        if (aiPath && aiPath.length > 0) {
          return aiPath;
        }
      } catch (error) {
        console.warn(
          "AI learning path failed, falling back to graph-based path:",
          error
        );
        // Continue with fallback method below
      }
    }

    // Fallback to graph-based path finding

    // Case-insensitive matching - find actual skill names in our graph
    const normalizedCurrentSkill = this._findSkillCaseInsensitive(currentSkill);
    const normalizedTargetSkill = this._findSkillCaseInsensitive(targetSkill);

    // If skills don't exist in our graph, return null
    if (!normalizedCurrentSkill || !normalizedTargetSkill) {
      return null;
    }

    // Use BFS to find shortest path
    const queue = [
      { skill: normalizedCurrentSkill, path: [normalizedCurrentSkill] },
    ];
    const visited = new Set([normalizedCurrentSkill]);

    while (queue.length > 0) {
      const { skill, path } = queue.shift();

      // Check if we've reached the target
      if (skill === normalizedTargetSkill) {
        // Convert path to enhanced format
        return path.map((skillName, index) => ({
          skill: skillName,
          explanation:
            index === 0
              ? `Starting point: ${skillName}`
              : `Next step in learning path after ${path[index - 1]}`,
          difficulty: Math.min(index + 1, 5),
        }));
      }

      // Add neighbors to queue
      for (const neighbor of this.skillGraph[skill]) {
        if (!visited.has(neighbor.skill)) {
          visited.add(neighbor.skill);
          queue.push({
            skill: neighbor.skill,
            path: [...path, neighbor.skill],
          });
        }
      }
    }

    // No path found
    return null;
  }

  /**
   * Recommend skills to learn based on current skills
   * Enhanced with AI recommendations when available
   *
   * @param {Array} userSkills - Array of user's current skills
   * @param {Number} limit - Maximum number of recommendations
   * @param {String} jobTitle - Optional job title to target recommendations
   * @returns {Promise<Array>} - Array of recommended skills with explanations
   */
  async recommendSkills(userSkills, limit = 5, jobTitle = "") {
    // Try to get AI-enhanced recommendations first
    if (this.hasAICapabilities) {
      try {
        const aiRecommendations =
          await geminiService.getEnhancedRecommendations(
            userSkills,
            limit,
            jobTitle
          );

        if (aiRecommendations && aiRecommendations.length > 0) {
          return aiRecommendations;
        }
      } catch (error) {
        console.warn(
          "AI recommendations failed, falling back to graph-based recommendations:",
          error
        );
        // Continue with fallback method below
      }
    }

    // Fallback to graph-based recommendations

    // Normalize user skills to match our graph (case-insensitive)
    const normalizedUserSkills = userSkills
      .map((skill) => this._findSkillCaseInsensitive(skill))
      .filter(Boolean); // Filter out any null values (skills not found)

    const recommendations = {};

    // Collect all related skills with their relationship scores
    normalizedUserSkills.forEach((skill) => {
      if (this.skillGraph[skill]) {
        this.skillGraph[skill].forEach((relation) => {
          // Skip skills the user already has
          if (normalizedUserSkills.includes(relation.skill)) {
            return;
          }

          // Add to recommendations with cumulative score
          if (!recommendations[relation.skill]) {
            recommendations[relation.skill] = 0;
          }

          recommendations[relation.skill] += relation.weight;
        });
      }
    });

    // Sort by score and take top N
    const graphRecommendations = Object.entries(recommendations)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, limit)
      .map(([skill, relevance]) => ({
        skill,
        relevance,
        explanation: this._getSkillExplanation(skill, normalizedUserSkills),
      }));

    return graphRecommendations;
  }

  /**
   * Generate a simple explanation for why a skill is recommended
   *
   * @private
   * @param {String} skill - Recommended skill
   * @param {Array} userSkills - User's current skills
   * @returns {String} - Simple explanation
   */
  _getSkillExplanation(skill, userSkills) {
    // Get the metadata if available
    const metadata = this.skillMetadata[skill];

    // Find related skills the user already has
    const relatedUserSkills = userSkills.filter((userSkill) => {
      return this.skillGraph[userSkill]?.some(
        (relation) => relation.skill === skill
      );
    });

    let explanation = "";

    // Add category info if available
    if (metadata?.category) {
      explanation += `${skill} is a popular ${metadata.category} skill. `;
    }

    // Add related skills info
    if (relatedUserSkills.length > 0) {
      explanation += `It pairs well with your knowledge of ${relatedUserSkills.join(
        ", "
      )}. `;
    }

    // Add description if available
    if (metadata?.description) {
      explanation += metadata.description;
    }

    // Default explanation if nothing else is available
    if (!explanation) {
      explanation = `${skill} is a valuable addition to your skill set.`;
    }

    return explanation;
  }

  /**
   * Helper method to find a skill in the graph regardless of case
   *
   * @param {String} skillToFind - The skill name to search for
   * @returns {String|null} - The actual skill name as stored in the graph, or null if not found
   */
  _findSkillCaseInsensitive(skillToFind) {
    if (!skillToFind) return null;

    // If exact match exists, return it
    if (this.skillGraph[skillToFind]) {
      return skillToFind;
    }

    // Otherwise, search case-insensitively
    const normalizedSearchTerm = skillToFind.toLowerCase();
    const allSkills = Object.keys(this.skillGraph);

    for (const skill of allSkills) {
      if (skill.toLowerCase() === normalizedSearchTerm) {
        return skill; // Return the properly cased version
      }
    }

    return null; // Skill not found
  }
}

module.exports = new SkillGraphService();
