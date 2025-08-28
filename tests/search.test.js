const searchService = require('../services/search');
const Job = require('../models/job');

// Mock the Job model
jest.mock('../models/job', () => ({
  find: jest.fn()
}));

describe('Search Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the inverted index
    searchService.invertedIndex = {};
    searchService.jobsCache = {};
    searchService.isIndexBuilt = false;
  });
  
  describe('tokenize', () => {
    test('should tokenize a string correctly', () => {
      const text = 'Frontend Developer with React.js and TypeScript experience';
      const tokens = searchService.tokenize(text);
      
      expect(tokens).toContain('frontend');
      expect(tokens).toContain('developer');
      expect(tokens).toContain('with');
      expect(tokens).toContain('react');
      expect(tokens).toContain('and');
      expect(tokens).toContain('typescript');
      expect(tokens).toContain('experience');
    });
    
    test('should filter out tokens that are too short', () => {
      const text = 'a b c def ghi';
      const tokens = searchService.tokenize(text);
      
      expect(tokens).not.toContain('a');
      expect(tokens).not.toContain('b');
      expect(tokens).not.toContain('c');
      expect(tokens).toContain('def');
      expect(tokens).toContain('ghi');
    });
    
    test('should handle empty or null input', () => {
      expect(searchService.tokenize('')).toEqual([]);
      expect(searchService.tokenize(null)).toEqual([]);
      expect(searchService.tokenize(undefined)).toEqual([]);
    });
  });
  
  describe('buildInvertedIndex', () => {
    test('should build an inverted index from jobs', async () => {
      // Mock job data
      const mockJobs = [
        {
          _id: 'job1',
          title: 'Frontend Developer',
          description: 'React.js experience required',
          company: 'TechCorp',
          requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS']
        },
        {
          _id: 'job2',
          title: 'Backend Developer',
          description: 'Node.js and Express experience required',
          company: 'WebSoft',
          requiredSkills: ['Node.js', 'Express', 'MongoDB']
        }
      ];
      
      // Set up Job.find mock
      Job.find.mockResolvedValue(mockJobs);
      
      // Build the index
      await searchService.buildInvertedIndex();
      
      // Verify the index was built
      expect(searchService.isIndexBuilt).toBe(true);
      
      // Check that tokens were added to the inverted index
      expect(searchService.invertedIndex['frontend']).toBeDefined();
      expect(searchService.invertedIndex['react']).toBeDefined();
      expect(searchService.invertedIndex['node']).toBeDefined();
      expect(searchService.invertedIndex['express']).toBeDefined();
      
      // Check that job IDs were added to the tokens
      expect(searchService.invertedIndex['frontend'].has('job1')).toBe(true);
      expect(searchService.invertedIndex['backend'].has('job2')).toBe(true);
      expect(searchService.invertedIndex['react'].has('job1')).toBe(true);
      expect(searchService.invertedIndex['node'].has('job2')).toBe(true);
      
      // Check that the job cache was populated
      expect(searchService.jobsCache['job1']).toEqual(mockJobs[0]);
      expect(searchService.jobsCache['job2']).toEqual(mockJobs[1]);
    });
  });
  
  describe('search', () => {
    test('should return matching jobs for a query', async () => {
      // Mock job data
      const mockJobs = [
        {
          _id: 'job1',
          title: 'Frontend Developer',
          description: 'React.js experience required',
          company: 'TechCorp',
          requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS']
        },
        {
          _id: 'job2',
          title: 'Backend Developer',
          description: 'Node.js and Express experience required',
          company: 'WebSoft',
          requiredSkills: ['Node.js', 'Express', 'MongoDB']
        },
        {
          _id: 'job3',
          title: 'Full Stack Developer',
          description: 'React and Node.js experience required',
          company: 'DevShop',
          requiredSkills: ['React', 'Node.js', 'JavaScript', 'MongoDB']
        }
      ];
      
      // Set up Job.find mock
      Job.find.mockResolvedValue(mockJobs);
      
      // Build the index
      await searchService.buildInvertedIndex();
      
      // Search for "React"
      const reactResults = await searchService.search('React');
      
      // Should match job1 and job3
      expect(reactResults).toHaveLength(2);
      expect(reactResults.some(job => job._id === 'job1')).toBe(true);
      expect(reactResults.some(job => job._id === 'job3')).toBe(true);
      
      // Search for "Backend"
      const backendResults = await searchService.search('Backend');
      
      // Should match job2
      expect(backendResults).toHaveLength(1);
      expect(backendResults[0]._id).toBe('job2');
      
      // Search for "Full Stack"
      const fullStackResults = await searchService.search('Full Stack');
      
      // Should match job3
      expect(fullStackResults).toHaveLength(1);
      expect(fullStackResults[0]._id).toBe('job3');
      
      // Search for multiple terms
      const reactNodeResults = await searchService.search('React Node.js');
      
      // Should prioritize job3 which has both terms
      expect(reactNodeResults[0]._id).toBe('job3');
    });
    
    test('should handle empty query', async () => {
      // Mock job data
      Job.find.mockResolvedValue([]);
      
      // Build the index
      await searchService.buildInvertedIndex();
      
      // Search with empty query
      const results = await searchService.search('');
      
      // Should return empty array
      expect(results).toEqual([]);
    });
  });
  
  describe('fallbackSearch', () => {
    test('should use MongoDB text search as fallback', async () => {
      // Mock MongoDB text search results
      const mockTextSearchResults = [
        {
          _id: 'job1',
          title: 'Frontend Developer',
          score: 1.5
        }
      ];
      
      // Set up Job.find mock with text search
      Job.find.mockImplementation((query, projection) => {
        // Check if it's a text search
        if (query.$text && query.$text.$search) {
          return {
            sort: () => ({
              limit: () => mockTextSearchResults
            })
          };
        }
        return [];
      });
      
      // Force the search to use the fallback
      searchService.invertedIndex = {}; // Empty index
      searchService.isIndexBuilt = true; // Pretend it's built
      
      // Spy on console.error and fallbackSearch
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const fallbackSpy = jest.spyOn(searchService, 'fallbackSearch');
      
      // Simulate an error in the main search method
      searchService.search = async (query, limit) => {
        throw new Error('Inverted index failed');
      };
      
      // Call the fallback method directly
      const results = await searchService.fallbackSearch('frontend');
      
      // Verify fallback results
      expect(results).toEqual(mockTextSearchResults);
      
      // Restore the original search method
      searchService.search.mockRestore();
      consoleErrorSpy.mockRestore();
      fallbackSpy.mockRestore();
    });
  });
});
