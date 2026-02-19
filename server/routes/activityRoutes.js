const express = require("express");
const router = express.Router();

const {
  createActivity,
  getActivities,
} = require("../controllers/activityController");

console.log(createActivity);
console.log(getActivities);

router.post("/", createActivity);
router.get("/", getActivities);

module.exports = router;
