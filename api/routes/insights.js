const express = require("express");
const geminiService = require("../../services/geminiService");
const User = require("../../models/user");
const Job = require("../../models/job");

const router = express.Router();

/**
 * @route POST /api/insights/job-fit
 * @desc  AI analysis of how well a user's skills fit a given job
 * @body  { userId, jobId } OR { userSkills:[], jobSkills:[], jobTitle, company }
 */
router.post("/job-fit", async (req, res) => {
  try {
    if (!geminiService.isAvailable) {
      return res.status(503).json({
        message:
          "AI service not available. Set GEMINI_API_KEY environment variable.",
      });
    }

    let { userId, jobId, userSkills, jobSkills, jobTitle, company } = req.body;

    // If IDs provided, fetch records
    if (userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      userSkills = user.skills;
    }
    if (jobId) {
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });
      jobSkills = job.requiredSkills || job.skills || [];
      jobTitle = job.title;
      company = job.company;
    }

    if (!userSkills || !Array.isArray(userSkills) || userSkills.length === 0) {
      return res
        .status(400)
        .json({ message: "userSkills required (directly or via userId)" });
    }
    if (!jobSkills || !Array.isArray(jobSkills) || jobSkills.length === 0) {
      return res
        .status(400)
        .json({ message: "jobSkills required (directly or via jobId)" });
    }
    if (!jobTitle) jobTitle = "Target Role";

    const analysis = await geminiService.getJobFitAnalysis(
      userSkills,
      jobSkills,
      jobTitle,
      company || ""
    );

    if (!analysis) {
      return res.status(500).json({ message: "AI analysis failed" });
    }

    res.json({
      meta: {
        userSkills,
        jobSkills,
        jobTitle,
        company: company || "",
        generatedAt: new Date().toISOString(),
      },
      analysis,
    });
  } catch (error) {
    console.error("Error generating job fit analysis:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
