const matcherService = require('../services/matcher');

// Mock the User and Job models
jest.mock('../models/user', () => ({
  findById: jest.fn()
}));

jest.mock('../models/job', () => ({
  find: jest.fn()
}));

const User = require('../models/user');
const Job = require('../models/job');

describe('Matcher Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('calculateJaccardSimilarity', () => {
    test('should return 1 for identical skill sets', () => {
      const userSkills = ['JavaScript', 'React', 'Node.js'];
      const jobSkills = ['JavaScript', 'React', 'Node.js'];
      
      const similarity = matcherService.calculateJaccardSimilarity(userSkills, jobSkills);
      
      expect(similarity).toBe(1);
    });
    
    test('should return 0 for completely different skill sets', () => {
      const userSkills = ['JavaScript', 'React', 'Node.js'];
      const jobSkills = ['Python', 'Django', 'Flask'];
      
      const similarity = matcherService.calculateJaccardSimilarity(userSkills, jobSkills);
      
      expect(similarity).toBe(0);
    });
    
    test('should return correct Jaccard similarity for partially matching sets', () => {
      const userSkills = ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'];
      const jobSkills = ['JavaScript', 'React', 'Angular', 'HTML'];
      
      // Intersection: JavaScript, React, HTML (3)
      // Union: JavaScript, React, Node.js, HTML, CSS, Angular (6)
      // Jaccard: 3/6 = 0.5
      
      const similarity = matcherService.calculateJaccardSimilarity(userSkills, jobSkills);
      
      expect(similarity).toBe(0.5);
    });
  });
  
  describe('calculateMatchScore', () => {
    test('should return 1 when user has all required skills', () => {
      const userSkills = ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'];
      const jobSkills = ['JavaScript', 'React', 'HTML'];
      
      const score = matcherService.calculateMatchScore(userSkills, jobSkills);
      
      expect(score).toBe(1);
    });
    
    test('should return 0 when user has none of the required skills', () => {
      const userSkills = ['JavaScript', 'React', 'Node.js'];
      const jobSkills = ['Python', 'Django', 'Flask'];
      
      const score = matcherService.calculateMatchScore(userSkills, jobSkills);
      
      expect(score).toBe(0);
    });
    
    test('should return correct match score for partial matches', () => {
      const userSkills = ['JavaScript', 'React', 'Node.js'];
      const jobSkills = ['JavaScript', 'React', 'Angular', 'TypeScript'];
      
      // 2 out of 4 skills match, so score should be 0.5
      const score = matcherService.calculateMatchScore(userSkills, jobSkills);
      
      expect(score).toBe(0.5);
    });
    
    test('should return 0 when job has no required skills', () => {
      const userSkills = ['JavaScript', 'React', 'Node.js'];
      const jobSkills = [];
      
      const score = matcherService.calculateMatchScore(userSkills, jobSkills);
      
      expect(score).toBe(0);
    });
  });
  
  describe('findMatchesForUser', () => {
    test('should find and rank job matches for a user', async () => {
      // Mock user data
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS']
      };
      
      // Mock jobs data
      const mockJobs = [
        {
          _id: 'job1',
          title: 'Frontend Developer',
          requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS']
        },
        {
          _id: 'job2',
          title: 'Backend Developer',
          requiredSkills: ['Node.js', 'Express', 'MongoDB']
        },
        {
          _id: 'job3',
          title: 'Full Stack Developer',
          requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB']
        }
      ];
      
      // Set up mocks
      User.findById.mockResolvedValue(mockUser);
      Job.find.mockResolvedValue(mockJobs);
      
      // Call the method
      const matches = await matcherService.findMatchesForUser('user123', 3, 'jaccard');
      
      // Assertions
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(Job.find).toHaveBeenCalled();
      expect(matches).toHaveLength(3);
      
      // Check ranking order (should be job3, job1, job2 based on skill overlap)
      expect(matches[0].job._id).toBe('job3');
      expect(matches[1].job._id).toBe('job1');
      expect(matches[2].job._id).toBe('job2');
      
      // Verify scores are calculated correctly
      expect(matches[0].score).toBeGreaterThan(matches[1].score);
      expect(matches[1].score).toBeGreaterThan(matches[2].score);
    });
    
    test('should throw error when user is not found', async () => {
      // Mock user not found
      User.findById.mockResolvedValue(null);
      
      // Expect the function to throw
      await expect(matcherService.findMatchesForUser('nonexistent')).rejects.toThrow('User not found');
      
      // Verify find was called with correct ID
      expect(User.findById).toHaveBeenCalledWith('nonexistent');
      expect(Job.find).not.toHaveBeenCalled();
    });
  });
});
