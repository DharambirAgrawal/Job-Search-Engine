const express = require('express');
const skillGraphService = require('../../services/skillGraph');

const router = express.Router();

/**
 * @route   GET /api/skills
 * @desc    Get all skills in the graph
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    const skills = skillGraphService.getAllSkills();
    res.json(skills);
  } catch (error) {
    console.error('Error getting skills:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/skills/related/:skill
 * @desc    Get related skills for a given skill
 * @access  Public
 */
router.get('/related/:skill', (req, res) => {
  try {
    const { skill } = req.params;
    const { minWeight = 0 } = req.query;
    
    const relatedSkills = skillGraphService.getRelatedSkills(
      skill, 
      parseFloat(minWeight)
    );
    
    res.json(relatedSkills);
  } catch (error) {
    console.error('Error getting related skills:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/skills/recommend
 * @desc    Recommend skills based on current skills
 * @access  Public
 */
router.post('/recommend', (req, res) => {
  try {
    const { skills, limit = 5 } = req.body;
    
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills array is required' });
    }
    
    const recommendations = skillGraphService.recommendSkills(
      skills, 
      parseInt(limit)
    );
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error recommending skills:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/skills/path
 * @desc    Find upskilling path between two skills
 * @access  Public
 */
router.get('/path', (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        message: 'Both "from" and "to" query parameters are required' 
      });
    }
    
    const path = skillGraphService.findUpskillingPath(from, to);
    
    if (!path) {
      return res.status(404).json({ 
        message: 'No path found between these skills' 
      });
    }
    
    res.json(path);
  } catch (error) {
    console.error('Error finding skill path:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
