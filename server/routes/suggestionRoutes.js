const express = require("express");
const router = express.Router();

const Activity = require("../models/Activity");
const generateSuggestions = require("../services/geminiService");

router.get("/", async (req, res) => {
  try {
    const latestActivity = await Activity.findOne().sort({
      createdAt: -1,
    });

    if (!latestActivity) {
      return res.json({ message: "No data found" });
    }

    const suggestions = await generateSuggestions(latestActivity);

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
