const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const geminiService = require("../../services/geminiService");
const Job = require("../../models/job");

const router = express.Router();

// Memory storage (resumes are transient, not persisted)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

/*
 * POST /api/advisor/analyze
 * Accepts: multipart/form-data with optional fields:
 *  - resume: PDF file
 *  - jobId: existing job to compare
 *  - jobDescription: raw description text
 *  - useAI: boolean flag ("true"/"false") whether to attempt AI enhancement
 * Returns: structured analysis { extracted: {resumeText, jobText, skills}, baseline: {...}, ai?: {...} }
 */
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const {
      jobId,
      jobDescription,
      useAI,
      resumeText: resumeTextRaw,
    } = req.body;
    let resumeText = resumeTextRaw || "";
    let jobText = jobDescription || "";

    // Extract text from uploaded PDF if present
    if (req.file) {
      try {
        const parsed = await pdfParse(req.file.buffer);
        resumeText = parsed.text || "";
      } catch (e) {
        return res.status(400).json({ message: "Failed to parse PDF resume" });
      }
    }

    // If jobId provided fetch job
    let jobDoc = null;
    if (jobId) {
      jobDoc = await Job.findById(jobId);
      if (!jobDoc) return res.status(404).json({ message: "Job not found" });
      if (!jobText)
        jobText = [jobDoc.title, jobDoc.company, jobDoc.description]
          .filter(Boolean)
          .join(" - ");
    }

    if (!resumeText && !jobText) {
      return res
        .status(400)
        .json({
          message:
            "Provide a resume (PDF or text) and/or job description or jobId",
        });
    }

    // Simple baseline skill extraction (naive keyword matching)
    const KNOWN_SKILLS = [
      "javascript",
      "react",
      "node",
      "node.js",
      "express",
      "css",
      "html",
      "python",
      "java",
      "docker",
      "kubernetes",
      "aws",
      "sql",
      "nosql",
      "mongodb",
      "postgres",
      "typescript",
      "graphql",
      "rest",
      "api",
      "git",
      "linux",
      "azure",
      "gcp",
    ];
    const extractSkills = (text) => {
      const lower = text.toLowerCase();
      const found = new Set();
      KNOWN_SKILLS.forEach((s) => {
        if (lower.includes(s)) found.add(s.replace("node.js", "node"));
      });
      return Array.from(found).sort();
    };

    // Basic word frequency for additional insights (simple tokenization)
    const tokenize = (text) =>
      text
        .toLowerCase()
        .split(/[^a-z0-9+.#]+/)
        .filter(Boolean);
    const freqMap = (tokens) =>
      tokens.reduce((acc, t) => {
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {});

    const resumeSkills = resumeText ? extractSkills(resumeText) : [];
    const jobSkills = jobText ? extractSkills(jobText) : jobDoc?.skills || [];

    const resumeTokens = resumeText ? tokenize(resumeText) : [];
    const jobTokens = jobText ? tokenize(jobText) : [];
    const resumeFreq = freqMap(resumeTokens);
    const jobFreq = freqMap(jobTokens);

    // Basic overlap / gaps
    const overlap = resumeSkills.filter((s) => jobSkills.includes(s));
    const missing = jobSkills.filter((s) => !resumeSkills.includes(s));
    const extra = resumeSkills.filter((s) => !jobSkills.includes(s));

    // Coverage metrics
    const coverage = jobSkills.length
      ? +((overlap.length / jobSkills.length) * 100).toFixed(2)
      : null;
    // Infer seniority heuristically (very naive): count of advanced keywords
    const advancedSignals = [
      "architecture",
      "scalable",
      "design",
      "lead",
      "mentored",
      "cloud",
      "microservices",
      "performance",
      "optimization",
    ];
    const seniorHits = advancedSignals.filter((sig) =>
      resumeText.toLowerCase().includes(sig)
    );
    let inferredSeniority = null;
    if (seniorHits.length >= 5) inferredSeniority = "Senior";
    else if (seniorHits.length >= 2) inferredSeniority = "Mid";
    else if (resumeText) inferredSeniority = "Junior";

    // Improvement suggestions (baseline, without AI) – simple rules
    const suggestions = [];
    if (missing.length)
      suggestions.push({
        type: "skill-gap",
        message: `Consider learning: ${missing.slice(0, 5).join(", ")}`,
      });
    if (extra.length)
      suggestions.push({
        type: "highlight",
        message: `Unique strengths (not explicitly in job): ${extra
          .slice(0, 5)
          .join(", ")}`,
      });
    if (coverage !== null && coverage < 50)
      suggestions.push({
        type: "coverage",
        message:
          "Increase alignment by adding concrete examples of required technologies.",
      });
    if (resumeText && resumeText.length < 400)
      suggestions.push({
        type: "detail",
        message:
          "Resume text appears short – add impact statements and metrics.",
      });
    if (inferredSeniority === "Junior" && seniorHits.length === 0)
      suggestions.push({
        type: "growth",
        message: "Add evidence of ownership (e.g., led, designed, improved).",
      });

    // Top repeated technical tokens (excluding generic words)
    const stop = new Set([
      "and",
      "the",
      "for",
      "with",
      "a",
      "of",
      "to",
      "in",
      "on",
      "at",
      "by",
      "is",
      "are",
      "an",
      "as",
      "or",
      "be",
      "from",
      "this",
      "that",
      "it",
      "using",
      "use",
    ]);
    const topResumeTerms = Object.entries(resumeFreq)
      .filter(
        ([w, c]) => c > 1 && w.length > 2 && !stop.has(w) && !/^[0-9]+$/.test(w)
      )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([term, count]) => ({ term, count }));
    const missingMentioned = missing.map((m) => ({
      skill: m,
      mentioned: !!resumeFreq[m],
    }));

    const baseline = {
      overlap,
      missing,
      extra,
      matchScore: coverage,
      coverage,
      inferredSeniority,
      topResumeTerms,
      missingMentioned,
      suggestions,
    };

    const response = {
      extracted: {
        resumeProvided: !!resumeText,
        jobProvided: !!jobText,
        resumeTextPreview: resumeText ? resumeText.slice(0, 1200) : "",
        jobTextPreview: jobText ? jobText.slice(0, 1200) : "",
        resumeSkills,
        jobSkills,
        resumeTokenCount: resumeTokens.length,
        jobTokenCount: jobTokens.length,
      },
      baseline,
    };

    const wantsAI = String(useAI).toLowerCase() === "true";
    if (wantsAI) {
      if (!geminiService.isAvailable) {
        response.ai = {
          available: false,
          message: "AI unavailable (missing API key)",
        };
      } else {
        try {
          const aiAnalysis = await geminiService.getJobFitAnalysis(
            resumeSkills,
            jobSkills,
            jobDoc?.title || "Target Role",
            jobDoc?.company || ""
          );
          response.ai = { available: true, analysis: aiAnalysis };
        } catch (e) {
          response.ai = { available: false, message: "AI analysis failed" };
        }
      }
    }

    res.json(response);
  } catch (error) {
    console.error("/advisor/analyze error", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
