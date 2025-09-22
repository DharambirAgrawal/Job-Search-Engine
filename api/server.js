const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const { connectDB } = require("../db/nedb-connection");

// Import routes
const userRoutes = require("./routes/users");
const jobRoutes = require("./routes/jobs");
const matchRoutes = require("./routes/match");
const searchRoutes = require("./routes/search");
const skillRoutes = require("./routes/skills");
const healthRoutes = require("./routes/health");

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/matcher", matchRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/health", healthRoutes);

// API info route
app.get("/api", (req, res) => {
  res.json({
    message: "Job Search Engine API",
    endpoints: {
      users: "/api/users",
      jobs: "/api/jobs",
      match: "/api/matcher/:userId",
      search: "/api/search?q=query",
      skills: "/api/skills",
    },
  });
});

// Serve static files from React app
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Simple root route to serve the React app
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
