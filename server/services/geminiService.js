const axios = require("axios");
const { GEMINI_API_KEY } = require("../config/gemini");

const generateSuggestions = async (activity) => {
  const prompt = `
User emitted ${activity.totalEmission} kg CO2 today.
Eco Score: ${activity.ecoScore}.

Breakdown:
Travel: ${JSON.stringify(activity.travel)}
Electricity: ${JSON.stringify(activity.electricity)}
Food: ${JSON.stringify(activity.food)}
Lifestyle: ${JSON.stringify(activity.lifestyle)}

Provide 5 short, practical, personalized suggestions to reduce carbon footprint.
Keep it clear and actionable.
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log("Gemini Error:", error.response?.data || error.message);
    return "Suggestion service unavailable.";
  }
};

module.exports = generateSuggestions;
