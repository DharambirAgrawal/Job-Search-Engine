const { db } = require('../db/nedb-connection');

/**
 * Utility functions for text search in NeDB
 */

/**
 * Perform a text search in the jobs collection
 * 
 * @param {String} query - Search query
 * @param {Number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of matching job objects
 */
const textSearch = (query, limit = 10) => {
  return new Promise((resolve, reject) => {
    // Create a regex for case-insensitive search
    const regex = new RegExp(query, 'i');
    
    // Search in title, description, company and skills
    const searchQuery = {
      $or: [
        { title: regex },
        { description: regex },
        { company: regex },
        { requiredSkills: { $elemMatch: regex } }
      ]
    };
    
    db.jobs.find(searchQuery).limit(limit).exec((err, docs) => {
      if (err) return reject(err);
      resolve(docs);
    });
  });
};

module.exports = {
  textSearch
};
