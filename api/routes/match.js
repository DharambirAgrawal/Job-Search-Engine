const express = require('express');
const matcherService = require('../../services/matcher');

const router = express.Router();

/**
 * @route   GET /api/matcher/match/:userId
 * @desc    Get job matches for a user
 * @access  Public
 */
router.get('/match/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, algorithm = 'jaccard' } = req.query;
    
    // Validate algorithm
    if (algorithm !== 'jaccard' && algorithm !== 'simple') {
      return res.status(400).json({ 
        message: 'Algorithm must be either "jaccard" or "simple"' 
      });
    }
    
    const matches = await matcherService.findMatchesForUser(
      userId, 
      parseInt(limit), 
      algorithm
    );
    
    res.json(matches);
  } catch (error) {
    console.error('Error getting matches:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
