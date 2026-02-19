const Activity = require("../models/Activity");
const calculateCarbon = require("../services/carbonCalculator");
const calculateEcoScore = require("../utils/ecoScore");
const calculateRewards = require("../services/rewardService");

exports.createActivity = async (req, res) => {
  try {
    const { totalEmission } = calculateCarbon(req.body);

    const ecoScore = calculateEcoScore(totalEmission);

    const { coins, badge } = calculateRewards(totalEmission);

    const activity = new Activity({
      ...req.body,
      totalEmission,
      ecoScore,
      coins,
      badge,
    });

    await activity.save();

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
