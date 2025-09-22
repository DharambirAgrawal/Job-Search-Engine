import axios from "axios";

// API base URL
const API_BASE_URL = "/api";

// API service functions
export const api = {
  // Users
  getUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  addUser: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${userId}`,
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Jobs
  getJobs: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      return response.data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  },

  addJob: async (jobData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/jobs`, jobData);
      return response.data;
    } catch (error) {
      console.error("Error adding job:", error);
      throw error;
    }
  },

  updateJob: async (jobId, jobData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/jobs/${jobId}`,
        jobData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  },

  deleteJob: async (jobId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  },

  // Match
  getMatches: async (userId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/matcher/match/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching matches:", error);
      throw error;
    }
  },

  // Search
  searchJobs: async (query) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching jobs:", error);
      throw error;
    }
  },

  // Skills
  getSkillRecommendations: async (skills, jobTitle = "") => {
    try {
      let url = `${API_BASE_URL}/skills/recommend?skills=${encodeURIComponent(
        skills
      )}`;

      if (jobTitle) {
        url += `&jobTitle=${encodeURIComponent(jobTitle)}`;
      }

      const response = await axios.get(url);
      return response.data.recommendations || [];
    } catch (error) {
      console.error("Error getting skill recommendations:", error);
      throw error;
    }
  },

  getSkillPath: async (fromSkill, toSkill) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/skills/path?from=${encodeURIComponent(
          fromSkill
        )}&to=${encodeURIComponent(toSkill)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting skill path:", error);
      throw error;
    }
  },
};
