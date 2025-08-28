const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../api/server');
const User = require('../models/user');
const Job = require('../models/job');

// Mock the services
jest.mock('../services/matcher');
jest.mock('../services/search');
jest.mock('../services/skillGraph');

const matcherService = require('../services/matcher');
const searchService = require('../services/search');

describe('API Routes', () => {
  beforeAll(async () => {
    // Mock mongoose connect to avoid actual DB connection
    mongoose.connect = jest.fn().mockResolvedValue({
      connection: { host: 'mockedHost' }
    });
    
    // Mock User and Job models
    User.findById = jest.fn();
    User.find = jest.fn();
    User.prototype.save = jest.fn();
    User.prototype.deleteOne = jest.fn();
    
    Job.findById = jest.fn();
    Job.find = jest.fn();
    Job.prototype.save = jest.fn();
    Job.prototype.deleteOne = jest.fn();
  });
  
  afterAll(() => {
    jest.resetAllMocks();
  });
  
  describe('User Routes', () => {
    test('GET /api/users should return all users', async () => {
      // Mock data
      const mockUsers = [
        { _id: 'user1', name: 'Alice', skills: ['JavaScript', 'React'] },
        { _id: 'user2', name: 'Bob', skills: ['Python', 'Django'] }
      ];
      
      // Set up mock
      User.find.mockResolvedValue(mockUsers);
      
      // Make request
      const response = await request(app).get('/api/users');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(User.find).toHaveBeenCalled();
    });
    
    test('POST /api/users should create a new user', async () => {
      // Mock data
      const mockUser = {
        _id: 'newUser',
        name: 'Charlie',
        skills: ['Node.js', 'Express']
      };
      
      // Set up mock
      User.prototype.save.mockResolvedValue(mockUser);
      
      // Create mock constructor to return mockUser
      User.mockImplementation(() => mockUser);
      
      // Make request
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Charlie',
          skills: ['Node.js', 'Express']
        });
      
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockUser);
      expect(User.prototype.save).toHaveBeenCalled();
    });
  });
  
  describe('Job Routes', () => {
    test('GET /api/jobs should return all jobs', async () => {
      // Mock data
      const mockJobs = [
        {
          _id: 'job1',
          title: 'Frontend Developer',
          description: 'React experience required',
          requiredSkills: ['React', 'JavaScript'],
          location: 'Remote',
          company: 'TechCorp'
        },
        {
          _id: 'job2',
          title: 'Backend Developer',
          description: 'Node.js experience required',
          requiredSkills: ['Node.js', 'Express'],
          location: 'San Francisco',
          company: 'WebSoft'
        }
      ];
      
      // Set up mock
      Job.find.mockResolvedValue(mockJobs);
      
      // Make request
      const response = await request(app).get('/api/jobs');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockJobs);
      expect(Job.find).toHaveBeenCalled();
    });
    
    test('POST /api/jobs should create a new job', async () => {
      // Mock data
      const mockJob = {
        _id: 'newJob',
        title: 'Full Stack Developer',
        description: 'Experience with React and Node.js required',
        requiredSkills: ['React', 'Node.js', 'JavaScript'],
        location: 'New York',
        company: 'DevShop'
      };
      
      // Set up mocks
      Job.prototype.save.mockResolvedValue(mockJob);
      searchService.refreshIndex.mockResolvedValue();
      
      // Create mock constructor to return mockJob
      Job.mockImplementation(() => mockJob);
      
      // Make request
      const response = await request(app)
        .post('/api/jobs')
        .send({
          title: 'Full Stack Developer',
          description: 'Experience with React and Node.js required',
          requiredSkills: ['React', 'Node.js', 'JavaScript'],
          location: 'New York',
          company: 'DevShop'
        });
      
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockJob);
      expect(Job.prototype.save).toHaveBeenCalled();
      expect(searchService.refreshIndex).toHaveBeenCalled();
    });
  });
  
  describe('Match Route', () => {
    test('GET /api/match/:userId should return job matches', async () => {
      // Mock data
      const userId = 'user123';
      const mockMatches = [
        {
          job: {
            _id: 'job1',
            title: 'Frontend Developer'
          },
          score: 0.8
        },
        {
          job: {
            _id: 'job2',
            title: 'Full Stack Developer'
          },
          score: 0.6
        }
      ];
      
      // Set up mock
      matcherService.findMatchesForUser.mockResolvedValue(mockMatches);
      
      // Make request
      const response = await request(app).get(`/api/match/${userId}`);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMatches);
      expect(matcherService.findMatchesForUser).toHaveBeenCalledWith(userId, 10, 'jaccard');
    });
    
    test('GET /api/match/:userId should handle user not found', async () => {
      // Set up mock to throw error
      matcherService.findMatchesForUser.mockRejectedValue(new Error('User not found'));
      
      // Make request
      const response = await request(app).get('/api/match/nonexistent');
      
      // Assertions
      expect(response.status).toBe(500); // In real code it should be 404, but our mock just throws
      expect(response.body.message).toBe('Server error');
    });
  });
  
  describe('Search Route', () => {
    test('GET /api/search should return search results', async () => {
      // Mock data
      const mockResults = [
        {
          _id: 'job1',
          title: 'Frontend Developer',
          description: 'React experience required'
        },
        {
          _id: 'job2',
          title: 'React Developer',
          description: 'Frontend experience required'
        }
      ];
      
      // Set up mock
      searchService.search.mockResolvedValue(mockResults);
      
      // Make request
      const response = await request(app).get('/api/search?q=react');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResults);
      expect(searchService.search).toHaveBeenCalledWith('react', 10);
    });
    
    test('GET /api/search should require a query parameter', async () => {
      // Make request without query parameter
      const response = await request(app).get('/api/search');
      
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Query parameter "q" is required');
      expect(searchService.search).not.toHaveBeenCalled();
    });
  });
});
