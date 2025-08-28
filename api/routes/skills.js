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
 * @route   GET /api/skills/common
 * @desc    Get most common skills in the graph
 * @access  Public
 */
router.get('/common', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const skills = skillGraphService.getCommonSkills(parseInt(limit));
    res.json(skills);
  } catch (error) {
    console.error('Error getting common skills:', error);
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
 * @route   POST /api/skills/path
 * @desc    Find upskilling path between two skills
 * @access  Public
 */
router.post('/path', (req, res) => {
  try {
    const { fromSkill, toSkill } = req.body;
    
    if (!fromSkill || !toSkill) {
      return res.status(400).json({ 
        message: 'Both "fromSkill" and "toSkill" are required' 
      });
    }
    
    const path = skillGraphService.findUpskillingPath(fromSkill, toSkill);
    
    res.json({ path: path || [] });
  } catch (error) {
    console.error('Error finding skill path:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
