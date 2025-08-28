/**
 * Utility functions for working with skills
 */

/**
 * Normalize a skill name (lowercase, trim, etc.)
 * 
 * @param {String} skill - Skill name to normalize
 * @returns {String} - Normalized skill name
 */
const normalizeSkill = (skill) => {
  if (!skill) return '';
  
  return skill
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, ' '); // Replace multiple spaces or hyphens with a single space
};

/**
 * Check if two skills are effectively the same
 * 
 * @param {String} skillA - First skill
 * @param {String} skillB - Second skill
 * @returns {Boolean} - Whether the skills are the same
 */
const areSkillsSame = (skillA, skillB) => {
  return normalizeSkill(skillA) === normalizeSkill(skillB);
};

/**
 * Extract skills from a text (e.g., job description)
 * This is a simple implementation - in a real system, you might use NLP or ML
 * 
 * @param {String} text - Text to extract skills from
 * @param {Array} skillsList - List of known skills to look for
 * @returns {Array} - Array of found skills
 */
const extractSkillsFromText = (text, skillsList) => {
  if (!text || !skillsList || !Array.isArray(skillsList)) {
    return [];
  }
  
  const normalizedText = text.toLowerCase();
  const foundSkills = [];
  
  skillsList.forEach(skill => {
    const normalizedSkill = normalizeSkill(skill);
    
    // Check if the skill appears in the text
    if (normalizedText.includes(normalizedSkill)) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
};

/**
 * Calculate cosine similarity between two arrays of skills
 * 
 * @param {Array} skillsA - First array of skills
 * @param {Array} skillsB - Second array of skills
 * @returns {Number} - Similarity score between 0 and 1
 */
const calculateCosineSimilarity = (skillsA, skillsB) => {
  if (!skillsA || !skillsB || !skillsA.length || !skillsB.length) {
    return 0;
  }
  
  // Convert to Sets for easier operations
  const setA = new Set(skillsA.map(normalizeSkill));
  const setB = new Set(skillsB.map(normalizeSkill));
  
  // Calculate intersection
  const intersection = new Set([...setA].filter(skill => setB.has(skill)));
  
  // Calculate cosine similarity
  return intersection.size / Math.sqrt(setA.size * setB.size);
};

module.exports = {
  normalizeSkill,
  areSkillsSame,
  extractSkillsFromText,
  calculateCosineSimilarity
};
