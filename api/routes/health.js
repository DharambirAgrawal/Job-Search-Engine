const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for monitoring
 * @access  Public
 */
router.get('/', (req, res) => {
  // Gather system information
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.status(200).json(health);
});

/**
 * @route   GET /api/health/ping
 * @desc    Simple ping endpoint for cron jobs
 * @access  Public
 */
router.get('/ping', (req, res) => {
  console.log(`[${new Date().toISOString()}] Received ping from external cron job`);
  res.status(200).send('pong');
});

module.exports = router;
