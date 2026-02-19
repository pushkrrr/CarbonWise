const Activity = require("../models/Activity");
const calculateSummary = require("../services/analyticsService");

exports.getAnalytics = async (req, res) => {
  try {
    const activities = await Activity.find();
    const summary = calculateSummary(activities);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
