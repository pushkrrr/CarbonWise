const axios = require("axios");
const { GEMINI_API_KEY, GEMINI_URL } =
  require("../config/gemini");

const generateSuggestions = async (activity) => {
  const prompt = `
  User emitted ${activity.totalEmission} kg CO2 today.
  Eco Score: ${activity.ecoScore}.
  
  Provide 5 short practical suggestions to reduce carbon footprint.
  Keep response concise.
  `;

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    return "Suggestion service unavailable.";
  }
};

module.exports = generateSuggestions;
