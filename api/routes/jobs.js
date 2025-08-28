const express = require('express');
const Job = require('../../models/job');
const searchService = require('../../services/search');

const router = express.Router();

/**
 * @route   POST /api/jobs
 * @desc    Create a new job
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, requiredSkills, location, company } = req.body;
    
    // Validate required fields
    if (!title || !description || !location || !company) {
      return res.status(400).json({ 
        message: 'Title, description, location, and company are required' 
      });
    }
    
    const job = new Job({
      title,
      description,
      requiredSkills: requiredSkills || [],
      location,
      company
    });
    
    await job.save();
    
    // Refresh search index when a new job is added
    await searchService.refreshIndex();
    
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.json(jobs);
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update job
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, description, requiredSkills, location, company } = req.body;
    
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (title) job.title = title;
    if (description) job.description = description;
    if (requiredSkills) job.requiredSkills = requiredSkills;
    if (location) job.location = location;
    if (company) job.company = company;
    
    await job.save();
    
    // Refresh search index when a job is updated
    await searchService.refreshIndex();
    
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete job
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    await job.deleteOne();
    
    // Refresh search index when a job is deleted
    await searchService.refreshIndex();
    
    res.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
