require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

module.exports = {
  GEMINI_API_KEY,
  GEMINI_URL,
};
