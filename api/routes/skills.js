const express = require("express");
const skillGraphService = require("../../services/skillGraph");

const router = express.Router();

/**
 * @route   GET /api/skills
 * @desc    Get all skills in the graph
 * @access  Public
 */
router.get("/", (req, res) => {
  try {
    const skills = skillGraphService.getAllSkills();
    res.json(skills);
  } catch (error) {
    console.error("Error getting skills:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/skills/common
 * @desc    Get most common skills in the graph
 * @access  Public
 */
router.get("/common", (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const skills = skillGraphService.getCommonSkills(parseInt(limit));
    res.json(skills);
  } catch (error) {
    console.error("Error getting common skills:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/skills/related/:skill
 * @desc    Get related skills for a given skill
 * @access  Public
 */
router.get("/related/:skill", (req, res) => {
  try {
    const { skill } = req.params;
    const { minWeight = 0 } = req.query;

    const relatedSkills = skillGraphService.getRelatedSkills(
      skill,
      parseFloat(minWeight)
    );

    res.json(relatedSkills);
  } catch (error) {
    console.error("Error getting related skills:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/skills/recommend
 * @desc    Recommend skills based on current skills
 * @access  Public
 */
router.get("/recommend", async (req, res) => {
  try {
    const { skills } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const jobTitle = req.query.jobTitle || "";

    if (!skills) {
      return res.status(400).json({ message: "Skills parameter is required" });
    }

    // Convert comma-separated string to array
    const skillsArray = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const recommendations = await skillGraphService.recommendSkills(
      skillsArray,
      limit,
      jobTitle
    );

    res.json({ recommendations });
  } catch (error) {
    console.error("Error recommending skills:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/skills/path
 * @desc    Find upskilling path between two skills
 * @access  Public
 */
router.get("/path", async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        message: 'Both "from" and "to" parameters are required',
      });
    }

    const path = await skillGraphService.findUpskillingPath(from, to);

    res.json({ path: path || [] });
  } catch (error) {
    console.error("Error finding skill path:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
