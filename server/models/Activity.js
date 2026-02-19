const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    travel: {
      carKm: Number,
      busKm: Number,
      flight: Boolean,
    },
    electricity: {
      units: Number,
      acHours: Number,
    },
    food: {
      vegMeals: Number,
      nonVegMeals: Number,
    },
    lifestyle: {
      plasticUsage: Number,
      recycled: Boolean,
    },
    totalEmission: Number,
    ecoScore: Number,
    coins: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
