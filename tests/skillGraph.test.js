const skillGraphService = require('../services/skillGraph');

describe('Skill Graph Service', () => {
  describe('addSkillRelationship', () => {
    test('should add a bidirectional relationship between skills', () => {
      // Clear existing relationships for testing
      skillGraphService.skillGraph = {};
      
      // Add a relationship
      skillGraphService.addSkillRelationship('JavaScript', 'TypeScript', 0.8);
      
      // Check forward relationship
      expect(skillGraphService.skillGraph['JavaScript']).toBeDefined();
      expect(skillGraphService.skillGraph['JavaScript'].length).toBe(1);
      expect(skillGraphService.skillGraph['JavaScript'][0].skill).toBe('TypeScript');
      expect(skillGraphService.skillGraph['JavaScript'][0].weight).toBe(0.8);
      
      // Check reverse relationship (with lower weight)
      expect(skillGraphService.skillGraph['TypeScript']).toBeDefined();
      expect(skillGraphService.skillGraph['TypeScript'].length).toBe(1);
      expect(skillGraphService.skillGraph['TypeScript'][0].skill).toBe('JavaScript');
      expect(skillGraphService.skillGraph['TypeScript'][0].weight).toBe(0.8 * 0.8); // 80% of original weight
    });
    
    test('should add multiple relationships for a skill', () => {
      // Clear existing relationships for testing
      skillGraphService.skillGraph = {};
      
      // Add multiple relationships
      skillGraphService.addSkillRelationship('JavaScript', 'React', 0.7);
      skillGraphService.addSkillRelationship('JavaScript', 'Node.js', 0.6);
      skillGraphService.addSkillRelationship('JavaScript', 'TypeScript', 0.8);
      
      // Check that all relationships were added
      expect(skillGraphService.skillGraph['JavaScript'].length).toBe(3);
      
      // Check that relationships with each skill were created
      expect(skillGraphService.skillGraph['React']).toBeDefined();
      expect(skillGraphService.skillGraph['Node.js']).toBeDefined();
      expect(skillGraphService.skillGraph['TypeScript']).toBeDefined();
    });
  });
  
  describe('getRelatedSkills', () => {
    beforeEach(() => {
      // Clear existing relationships for testing
      skillGraphService.skillGraph = {};
      
      // Add test relationships
      skillGraphService.addSkillRelationship('JavaScript', 'React', 0.7);
      skillGraphService.addSkillRelationship('JavaScript', 'Node.js', 0.6);
      skillGraphService.addSkillRelationship('JavaScript', 'TypeScript', 0.8);
      skillGraphService.addSkillRelationship('React', 'Redux', 0.9);
    });
    
    test('should return related skills sorted by weight', () => {
      const relatedSkills = skillGraphService.getRelatedSkills('JavaScript');
      
      // Should have 3 related skills
      expect(relatedSkills.length).toBe(3);
      
      // Should be sorted by weight (descending)
      expect(relatedSkills[0].skill).toBe('TypeScript'); // 0.8
      expect(relatedSkills[1].skill).toBe('React');      // 0.7
      expect(relatedSkills[2].skill).toBe('Node.js');    // 0.6
    });
    
    test('should filter by minimum weight', () => {
      const relatedSkills = skillGraphService.getRelatedSkills('JavaScript', 0.7);
      
      // Should only include skills with weight >= 0.7
      expect(relatedSkills.length).toBe(2);
      expect(relatedSkills[0].skill).toBe('TypeScript'); // 0.8
      expect(relatedSkills[1].skill).toBe('React');      // 0.7
    });
    
    test('should return empty array for unknown skill', () => {
      const relatedSkills = skillGraphService.getRelatedSkills('UnknownSkill');
      
      expect(relatedSkills).toEqual([]);
    });
  });
  
  describe('findUpskillingPath', () => {
    beforeEach(() => {
      // Clear existing relationships for testing
      skillGraphService.skillGraph = {};
      
      // Create a test graph
      // HTML -> CSS -> SASS
      //   ↓
      // JavaScript -> React -> Redux
      //   ↓
      // Node.js -> Express
      
      skillGraphService.addSkillRelationship('HTML', 'CSS', 0.9);
      skillGraphService.addSkillRelationship('HTML', 'JavaScript', 0.7);
      skillGraphService.addSkillRelationship('CSS', 'SASS', 0.8);
      skillGraphService.addSkillRelationship('JavaScript', 'React', 0.7);
      skillGraphService.addSkillRelationship('JavaScript', 'Node.js', 0.6);
      skillGraphService.addSkillRelationship('React', 'Redux', 0.9);
      skillGraphService.addSkillRelationship('Node.js', 'Express', 0.8);
    });
    
    test('should find direct path between adjacent skills', () => {
      const path = skillGraphService.findUpskillingPath('JavaScript', 'React');
      
      expect(path).toEqual(['JavaScript', 'React']);
    });
    
    test('should find multi-step path between distant skills', () => {
      const path = skillGraphService.findUpskillingPath('HTML', 'Redux');
      
      // One possible path is HTML -> JavaScript -> React -> Redux
      expect(path).toContain('HTML');
      expect(path).toContain('Redux');
      expect(path.length).toBeGreaterThan(2); // Should have intermediate steps
    });
    
    test('should return null for unreachable skills', () => {
      // Add an isolated skill with no connections
      skillGraphService.skillGraph['Python'] = [];
      
      const path = skillGraphService.findUpskillingPath('HTML', 'Python');
      
      expect(path).toBeNull();
    });
    
    test('should return null if either skill does not exist', () => {
      const path = skillGraphService.findUpskillingPath('HTML', 'UnknownSkill');
      
      expect(path).toBeNull();
    });
  });
  
  describe('recommendSkills', () => {
    beforeEach(() => {
      // Reset the graph for testing
      skillGraphService.skillGraph = {};
      skillGraphService.skillMetadata = {};
      
      // Create test relationships
      skillGraphService.addSkillRelationship('JavaScript', 'React', 0.7);
      skillGraphService.addSkillRelationship('JavaScript', 'Vue.js', 0.7);
      skillGraphService.addSkillRelationship('JavaScript', 'Angular', 0.7);
      skillGraphService.addSkillRelationship('JavaScript', 'Node.js', 0.6);
      skillGraphService.addSkillRelationship('React', 'Redux', 0.8);
      skillGraphService.addSkillRelationship('Node.js', 'Express', 0.9);
      skillGraphService.addSkillRelationship('Node.js', 'MongoDB', 0.7);
      
      // Add some metadata
      skillGraphService.addSkillMetadata('React', {
        category: 'Frontend',
        popularity: 0.9
      });
      
      skillGraphService.addSkillMetadata('Node.js', {
        category: 'Backend',
        popularity: 0.85
      });
    });
    
    test('should recommend skills based on a single skill', () => {
      const recommendations = skillGraphService.recommendSkills(['JavaScript']);
      
      // Should recommend React, Vue.js, Angular, Node.js
      expect(recommendations.length).toBeLessThanOrEqual(5); // Limited to 5 by default
      
      // All recommendations should have the skill property
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('skill');
        expect(rec).toHaveProperty('score');
      });
      
      // Should not recommend skills the user already has
      expect(recommendations.some(rec => rec.skill === 'JavaScript')).toBe(false);
      
      // Check for specific skills
      const skills = recommendations.map(rec => rec.skill);
      expect(skills).toContain('React');
      expect(skills).toContain('Node.js');
    });
    
    test('should recommend skills based on multiple skills', () => {
      const recommendations = skillGraphService.recommendSkills(['JavaScript', 'React']);
      
      // All recommendations should have a score
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('score');
      });
      
      // Should not recommend skills the user already has
      expect(recommendations.some(rec => rec.skill === 'JavaScript')).toBe(false);
      expect(recommendations.some(rec => rec.skill === 'React')).toBe(false);
      
      // Redux should be recommended because of React
      expect(recommendations.some(rec => rec.skill === 'Redux')).toBe(true);
    });
    
    test('should include metadata in recommendations', () => {
      const recommendations = skillGraphService.recommendSkills(['JavaScript']);
      
      // Find the React recommendation
      const reactRec = recommendations.find(rec => rec.skill === 'React');
      
      // Should have metadata
      expect(reactRec).toBeDefined();
      expect(reactRec.metadata).toBeDefined();
      expect(reactRec.metadata.category).toBe('Frontend');
      expect(reactRec.metadata.popularity).toBe(0.9);
    });
    
    test('should limit the number of recommendations', () => {
      // Request only 2 recommendations
      const recommendations = skillGraphService.recommendSkills(['JavaScript'], 2);
      
      // Should only return 2 recommendations
      expect(recommendations.length).toBe(2);
      
      // Should be sorted by score
      expect(recommendations[0].score).toBeGreaterThanOrEqual(recommendations[1].score);
    });
  });
});
