const Activity = require("../models/Activity");

exports.getGamificationStats = async (req, res) => {
  try {
    const activities = await Activity.find();

    let totalCoins = 0;
    let badges = [];

    activities.forEach((a) => {
      totalCoins += a.coins;

      if (a.badge && !badges.includes(a.badge)) {
        badges.push(a.badge);
      }
    });

    res.json({
      totalCoins,
      badges,
      totalDays: activities.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
