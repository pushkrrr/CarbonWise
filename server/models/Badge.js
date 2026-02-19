const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  threshold: Number, // emission threshold
});

module.exports = mongoose.model("Badge", badgeSchema);
