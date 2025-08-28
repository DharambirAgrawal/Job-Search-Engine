const express = require('express');
const searchService = require('../../services/search');

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Search for jobs
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }
    
    const results = await searchService.search(q, parseInt(limit));
    
    res.json(results);
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
