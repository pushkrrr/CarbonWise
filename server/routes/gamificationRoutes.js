const express = require("express");
const router = express.Router();

const {
  getGamificationStats,
} = require("../controllers/gamificationController");

router.get("/", getGamificationStats);

module.exports = router;
