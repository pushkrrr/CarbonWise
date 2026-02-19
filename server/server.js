const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const activityRoutes = require("./routes/activityRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/activity", activityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/gamification", gamificationRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Carbon Tracker API Running...");
});

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
