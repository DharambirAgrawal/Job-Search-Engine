#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// API base URL
const API_URL = 'http://localhost:3000/api';

/**
 * Simple CLI client for interacting with the Job Search Engine API
 */
class JobSearchCli {
  constructor() {
    this.userId = null;
    this.jobId = null;
  }
  
  /**
   * Start the CLI application
   */
  async start() {
    console.log('='.repeat(50));
    console.log('Job Search Engine CLI');
    console.log('='.repeat(50));
    
    await this.showMainMenu();
  }
  
  /**
   * Display the main menu
   */
  async showMainMenu() {
    console.log('\nMain Menu:');
    console.log('1. User Operations');
    console.log('2. Job Operations');
    console.log('3. Find Job Matches');
    console.log('4. Search Jobs');
    console.log('5. Skill Operations');
    console.log('0. Exit');
    
    const answer = await this.ask('Select an option: ');
    
    switch (answer) {
      case '1':
        await this.showUserMenu();
        break;
      case '2':
        await this.showJobMenu();
        break;
      case '3':
        await this.findMatches();
        break;
      case '4':
        await this.searchJobs();
        break;
      case '5':
        await this.showSkillMenu();
        break;
      case '0':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid option. Please try again.');
        await this.showMainMenu();
    }
  }
  
  /**
   * Display the user operations menu
   */
  async showUserMenu() {
    console.log('\nUser Operations:');
    console.log('1. List all users');
    console.log('2. Get user details');
    console.log('3. Create new user');
    console.log('4. Update user');
    console.log('5. Delete user');
    console.log('0. Back to main menu');
    
    const answer = await this.ask('Select an option: ');
    
    switch (answer) {
      case '1':
        await this.listUsers();
        break;
      case '2':
        await this.getUserDetails();
        break;
      case '3':
        await this.createUser();
        break;
      case '4':
        await this.updateUser();
        break;
      case '5':
        await this.deleteUser();
        break;
      case '0':
        await this.showMainMenu();
        break;
      default:
        console.log('Invalid option. Please try again.');
        await this.showUserMenu();
    }
  }
  
  /**
   * Display the job operations menu
   */
  async showJobMenu() {
    console.log('\nJob Operations:');
    console.log('1. List all jobs');
    console.log('2. Get job details');
    console.log('3. Create new job');
    console.log('4. Update job');
    console.log('5. Delete job');
    console.log('0. Back to main menu');
    
    const answer = await this.ask('Select an option: ');
    
    switch (answer) {
      case '1':
        await this.listJobs();
        break;
      case '2':
        await this.getJobDetails();
        break;
      case '3':
        await this.createJob();
        break;
      case '4':
        await this.updateJob();
        break;
      case '5':
        await this.deleteJob();
        break;
      case '0':
        await this.showMainMenu();
        break;
      default:
        console.log('Invalid option. Please try again.');
        await this.showJobMenu();
    }
  }
  
  /**
   * Display the skill operations menu
   */
  async showSkillMenu() {
    console.log('\nSkill Operations:');
    console.log('1. List all skills');
    console.log('2. Get related skills');
    console.log('3. Get skill recommendations');
    console.log('4. Find skill path');
    console.log('0. Back to main menu');
    
    const answer = await this.ask('Select an option: ');
    
    switch (answer) {
      case '1':
        await this.listSkills();
        break;
      case '2':
        await this.getRelatedSkills();
        break;
      case '3':
        await this.getSkillRecommendations();
        break;
      case '4':
        await this.findSkillPath();
        break;
      case '0':
        await this.showMainMenu();
        break;
      default:
        console.log('Invalid option. Please try again.');
        await this.showSkillMenu();
    }
  }
  
  /**
   * List all users
   */
  async listUsers() {
    try {
      const response = await axios.get(`${API_URL}/users`);
      
      if (response.data.length === 0) {
        console.log('No users found.');
      } else {
        console.log('\nUsers:');
        response.data.forEach(user => {
          console.log(`ID: ${user._id}, Name: ${user.name}, Skills: ${user.skills.join(', ')}`);
        });
      }
    } catch (error) {
      console.error('Error listing users:', error.message);
    }
    
    await this.showUserMenu();
  }
  
  /**
   * Get details for a specific user
   */
  async getUserDetails() {
    try {
      const userId = await this.ask('Enter user ID: ');
      
      const response = await axios.get(`${API_URL}/users/${userId}`);
      
      console.log('\nUser Details:');
      console.log(`ID: ${response.data._id}`);
      console.log(`Name: ${response.data.name}`);
      console.log(`Skills: ${response.data.skills.join(', ')}`);
      console.log(`Created: ${new Date(response.data.createdAt).toLocaleString()}`);
      console.log(`Updated: ${new Date(response.data.updatedAt).toLocaleString()}`);
    } catch (error) {
      console.error('Error getting user details:', error.message);
    }
    
    await this.showUserMenu();
  }
  
  /**
   * Create a new user
   */
  async createUser() {
    try {
      const name = await this.ask('Enter user name: ');
      const skillsInput = await this.ask('Enter skills (comma-separated): ');
      const skills = skillsInput.split(',').map(skill => skill.trim());
      
      const response = await axios.post(`${API_URL}/users`, {
        name,
        skills
      });
      
      console.log(`\nUser created successfully with ID: ${response.data._id}`);
      this.userId = response.data._id;
    } catch (error) {
      console.error('Error creating user:', error.message);
    }
    
    await this.showUserMenu();
  }
  
  /**
   * Update an existing user
   */
  async updateUser() {
    try {
      const userId = await this.ask('Enter user ID: ');
      const name = await this.ask('Enter new name (leave empty to keep current): ');
      const skillsInput = await this.ask('Enter new skills (comma-separated, leave empty to keep current): ');
      
      const updateData = {};
      if (name) updateData.name = name;
      if (skillsInput) updateData.skills = skillsInput.split(',').map(skill => skill.trim());
      
      const response = await axios.put(`${API_URL}/users/${userId}`, updateData);
      
      console.log('\nUser updated successfully:');
      console.log(`ID: ${response.data._id}`);
      console.log(`Name: ${response.data.name}`);
      console.log(`Skills: ${response.data.skills.join(', ')}`);
    } catch (error) {
      console.error('Error updating user:', error.message);
    }
    
    await this.showUserMenu();
  }
  
  /**
   * Delete a user
   */
  async deleteUser() {
    try {
      const userId = await this.ask('Enter user ID to delete: ');
      
      const confirmation = await this.ask(`Are you sure you want to delete user ${userId}? (y/n): `);
      
      if (confirmation.toLowerCase() === 'y') {
        await axios.delete(`${API_URL}/users/${userId}`);
        console.log('User deleted successfully.');
        
        if (this.userId === userId) {
          this.userId = null;
        }
      } else {
        console.log('Deletion cancelled.');
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
    
    await this.showUserMenu();
  }
  
  /**
   * List all jobs
   */
  async listJobs() {
    try {
      const response = await axios.get(`${API_URL}/jobs`);
      
      if (response.data.length === 0) {
        console.log('No jobs found.');
      } else {
        console.log('\nJobs:');
        response.data.forEach(job => {
          console.log(`ID: ${job._id}`);
          console.log(`Title: ${job.title}`);
          console.log(`Company: ${job.company}`);
          console.log(`Location: ${job.location}`);
          console.log(`Required Skills: ${job.requiredSkills.join(', ')}`);
          console.log('-'.repeat(40));
        });
      }
    } catch (error) {
      console.error('Error listing jobs:', error.message);
    }
    
    await this.showJobMenu();
  }
  
  /**
   * Get details for a specific job
   */
  async getJobDetails() {
    try {
      const jobId = await this.ask('Enter job ID: ');
      
      const response = await axios.get(`${API_URL}/jobs/${jobId}`);
      
      console.log('\nJob Details:');
      console.log(`ID: ${response.data._id}`);
      console.log(`Title: ${response.data.title}`);
      console.log(`Company: ${response.data.company}`);
      console.log(`Location: ${response.data.location}`);
      console.log(`Required Skills: ${response.data.requiredSkills.join(', ')}`);
      console.log(`Description: ${response.data.description}`);
      console.log(`Created: ${new Date(response.data.createdAt).toLocaleString()}`);
      console.log(`Updated: ${new Date(response.data.updatedAt).toLocaleString()}`);
    } catch (error) {
      console.error('Error getting job details:', error.message);
    }
    
    await this.showJobMenu();
  }
  
  /**
   * Create a new job
   */
  async createJob() {
    try {
      const title = await this.ask('Enter job title: ');
      const company = await this.ask('Enter company name: ');
      const location = await this.ask('Enter job location: ');
      const skillsInput = await this.ask('Enter required skills (comma-separated): ');
      const description = await this.ask('Enter job description: ');
      
      const requiredSkills = skillsInput.split(',').map(skill => skill.trim());
      
      const response = await axios.post(`${API_URL}/jobs`, {
        title,
        company,
        location,
        requiredSkills,
        description
      });
      
      console.log(`\nJob created successfully with ID: ${response.data._id}`);
      this.jobId = response.data._id;
    } catch (error) {
      console.error('Error creating job:', error.message);
    }
    
    await this.showJobMenu();
  }
  
  /**
   * Update an existing job
   */
  async updateJob() {
    try {
      const jobId = await this.ask('Enter job ID: ');
      const title = await this.ask('Enter new title (leave empty to keep current): ');
      const company = await this.ask('Enter new company (leave empty to keep current): ');
      const location = await this.ask('Enter new location (leave empty to keep current): ');
      const skillsInput = await this.ask('Enter new required skills (comma-separated, leave empty to keep current): ');
      const description = await this.ask('Enter new description (leave empty to keep current): ');
      
      const updateData = {};
      if (title) updateData.title = title;
      if (company) updateData.company = company;
      if (location) updateData.location = location;
      if (skillsInput) updateData.requiredSkills = skillsInput.split(',').map(skill => skill.trim());
      if (description) updateData.description = description;
      
      const response = await axios.put(`${API_URL}/jobs/${jobId}`, updateData);
      
      console.log('\nJob updated successfully:');
      console.log(`ID: ${response.data._id}`);
      console.log(`Title: ${response.data.title}`);
      console.log(`Company: ${response.data.company}`);
    } catch (error) {
      console.error('Error updating job:', error.message);
    }
    
    await this.showJobMenu();
  }
  
  /**
   * Delete a job
   */
  async deleteJob() {
    try {
      const jobId = await this.ask('Enter job ID to delete: ');
      
      const confirmation = await this.ask(`Are you sure you want to delete job ${jobId}? (y/n): `);
      
      if (confirmation.toLowerCase() === 'y') {
        await axios.delete(`${API_URL}/jobs/${jobId}`);
        console.log('Job deleted successfully.');
        
        if (this.jobId === jobId) {
          this.jobId = null;
        }
      } else {
        console.log('Deletion cancelled.');
      }
    } catch (error) {
      console.error('Error deleting job:', error.message);
    }
    
    await this.showJobMenu();
  }
  
  /**
   * Find job matches for a user
   */
  async findMatches() {
    try {
      const userId = await this.ask('Enter user ID: ');
      const algorithm = await this.ask('Choose algorithm (jaccard/simple): ');
      const limitInput = await this.ask('Enter maximum number of results: ');
      
      const limit = limitInput ? parseInt(limitInput) : 10;
      
      const response = await axios.get(`${API_URL}/match/${userId}`, {
        params: {
          algorithm: algorithm || 'jaccard',
          limit
        }
      });
      
      if (response.data.length === 0) {
        console.log('No matches found.');
      } else {
        console.log('\nMatches:');
        response.data.forEach((match, index) => {
          console.log(`\n#${index + 1} - Match Score: ${(match.score * 100).toFixed(1)}%`);
          console.log(`Title: ${match.job.title}`);
          console.log(`Company: ${match.job.company}`);
          console.log(`Location: ${match.job.location}`);
          console.log(`Required Skills: ${match.job.requiredSkills.join(', ')}`);
        });
      }
    } catch (error) {
      console.error('Error finding matches:', error.message);
    }
    
    await this.showMainMenu();
  }
  
  /**
   * Search for jobs
   */
  async searchJobs() {
    try {
      const query = await this.ask('Enter search query: ');
      const limitInput = await this.ask('Enter maximum number of results: ');
      
      const limit = limitInput ? parseInt(limitInput) : 10;
      
      const response = await axios.get(`${API_URL}/search`, {
        params: {
          q: query,
          limit
        }
      });
      
      if (response.data.length === 0) {
        console.log('No results found.');
      } else {
        console.log(`\nFound ${response.data.length} result(s):`);
        response.data.forEach((job, index) => {
          console.log(`\n#${index + 1}`);
          console.log(`Title: ${job.title}`);
          console.log(`Company: ${job.company}`);
          console.log(`Location: ${job.location}`);
          console.log(`Required Skills: ${job.requiredSkills.join(', ')}`);
        });
      }
    } catch (error) {
      console.error('Error searching jobs:', error.message);
    }
    
    await this.showMainMenu();
  }
  
  /**
   * List all skills in the system
   */
  async listSkills() {
    try {
      const response = await axios.get(`${API_URL}/skills`);
      
      if (response.data.length === 0) {
        console.log('No skills found.');
      } else {
        console.log('\nSkills:');
        const skills = response.data.sort();
        
        // Print in columns
        const columns = 3;
        const rows = Math.ceil(skills.length / columns);
        
        for (let i = 0; i < rows; i++) {
          let row = '';
          for (let j = 0; j < columns; j++) {
            const index = i + j * rows;
            if (index < skills.length) {
              row += skills[index].padEnd(20);
            }
          }
          console.log(row);
        }
      }
    } catch (error) {
      console.error('Error listing skills:', error.message);
    }
    
    await this.showSkillMenu();
  }
  
  /**
   * Get related skills
   */
  async getRelatedSkills() {
    try {
      const skill = await this.ask('Enter skill: ');
      const minWeightInput = await this.ask('Enter minimum weight (0-1): ');
      
      const minWeight = minWeightInput ? parseFloat(minWeightInput) : 0;
      
      const response = await axios.get(`${API_URL}/skills/related/${skill}`, {
        params: {
          minWeight
        }
      });
      
      if (response.data.length === 0) {
        console.log('No related skills found.');
      } else {
        console.log(`\nSkills related to ${skill}:`);
        response.data.forEach(related => {
          console.log(`${related.skill} - Relationship Strength: ${(related.weight * 100).toFixed(1)}%`);
        });
      }
    } catch (error) {
      console.error('Error getting related skills:', error.message);
    }
    
    await this.showSkillMenu();
  }
  
  /**
   * Get skill recommendations
   */
  async getSkillRecommendations() {
    try {
      const skillsInput = await this.ask('Enter current skills (comma-separated): ');
      const limitInput = await this.ask('Enter maximum number of recommendations: ');
      
      const skills = skillsInput.split(',').map(skill => skill.trim());
      const limit = limitInput ? parseInt(limitInput) : 5;
      
      const response = await axios.post(`${API_URL}/skills/recommend`, {
        skills,
        limit
      });
      
      if (response.data.length === 0) {
        console.log('No recommendations found.');
      } else {
        console.log('\nRecommended Skills:');
        response.data.forEach((recommendation, index) => {
          console.log(`\n#${index + 1} - ${recommendation.skill}`);
          console.log(`Score: ${(recommendation.score * 100).toFixed(1)}%`);
          
          if (recommendation.metadata && Object.keys(recommendation.metadata).length > 0) {
            console.log('Metadata:');
            Object.entries(recommendation.metadata).forEach(([key, value]) => {
              console.log(`  ${key}: ${value}`);
            });
          }
        });
      }
    } catch (error) {
      console.error('Error getting skill recommendations:', error.message);
    }
    
    await this.showSkillMenu();
  }
  
  /**
   * Find path between skills
   */
  async findSkillPath() {
    try {
      const fromSkill = await this.ask('Enter starting skill: ');
      const toSkill = await this.ask('Enter target skill: ');
      
      const response = await axios.get(`${API_URL}/skills/path`, {
        params: {
          from: fromSkill,
          to: toSkill
        }
      });
      
      console.log('\nSkill Path:');
      
      response.data.forEach((skill, index) => {
        if (index < response.data.length - 1) {
          console.log(`${skill} → `);
        } else {
          console.log(skill);
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('No path found between these skills.');
      } else {
        console.error('Error finding skill path:', error.message);
      }
    }
    
    await this.showSkillMenu();
  }
  
  /**
   * Prompt the user for input
   * 
   * @param {String} question - Question to ask
   * @returns {Promise<String>} - User's response
   */
  ask(question) {
    return new Promise(resolve => {
      rl.question(question, answer => {
        resolve(answer);
      });
    });
  }
}

// Add axios response interceptor for cleaner error messages
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with an error status
      const status = error.response.status;
      const message = error.response.data.message || 'Unknown server error';
      error.message = `Server Error (${status}): ${message}`;
    } else if (error.request) {
      // The request was made but no response was received
      error.message = 'No response received from server. Is the server running?';
    }
    return Promise.reject(error);
  }
);

// Run the CLI
const cli = new JobSearchCli();
cli.start();
