const express = require('express');
const cors = require('cors');
const { connectDB } = require('../db/nedb-connection');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const matchRoutes = require('./routes/match');
const searchRoutes = require('./routes/search');
const skillRoutes = require('./routes/skills');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/skills', skillRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Job Search Engine API',
    endpoints: {
      users: '/api/users',
      jobs: '/api/jobs',
      match: '/api/match/:userId',
      search: '/api/search?q=query',
      skills: '/api/skills'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
