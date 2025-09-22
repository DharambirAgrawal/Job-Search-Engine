const express = require("express");
const User = require("../../models/user");

const router = express.Router();

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 */
router.post("/", async (req, res) => {
  try {
    const { name, skills } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = new User({
      name,
      skills: skills || [],
    });

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Public
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, skills } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (skills) user.skills = skills;

    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Public
 */
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
