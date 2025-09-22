const express = require("express");
const searchService = require("../../services/search");

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Search for jobs
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ message: 'Query parameter "q" is required' });
    }

    const results = await searchService.search(q, parseInt(limit));

    // Format the response to match what the frontend expects
    const formattedResults = results.map((job, index) => {
      // Calculate a relevance score based on position in results (higher = more relevant)
      // First result gets 100%, last result gets 70%
      const relevance = 100 - index * (30 / Math.max(1, results.length - 1));

      return {
        ...job,
        relevance: Math.round(relevance),
      };
    });

    res.json(formattedResults);
  } catch (error) {
    console.error("Error searching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
