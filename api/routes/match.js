const express = require("express");
const matcherService = require("../../services/matcher");
const User = require("../../models/user");

const router = express.Router();

/**
 * @route   GET /api/matcher/match/:userId
 * @desc    Get job matches for a user
 * @access  Public
 */
router.get("/match/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, algorithm = "jaccard" } = req.query;

    // Validate algorithm
    if (algorithm !== "jaccard" && algorithm !== "simple") {
      return res.status(400).json({
        message: 'Algorithm must be either "jaccard" or "simple"',
      });
    }

    const matches = await matcherService.findMatchesForUser(
      userId,
      parseInt(limit),
      algorithm
    );

    // Get user for missing skills calculation
    const user = await User.findById(userId);
    const userSkills = user ? user.skills : [];

    // Format the response to match what the frontend expects
    const formattedMatches = matches.map((match) => {
      const jobSkills = match.job.requiredSkills || [];

      // Find missing skills
      const missingSkills = jobSkills.filter(
        (skill) => !userSkills.includes(skill)
      );

      return {
        _id: match.job._id,
        title: match.job.title,
        company: match.job.company,
        location: match.job.location,
        description: match.job.description,
        skills: match.job.requiredSkills,
        matchScore: match.score * 100, // Convert to percentage
        missingSkills: missingSkills,
      };
    });

    res.json(formattedMatches);
  } catch (error) {
    console.error("Error getting matches:", error);

    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
