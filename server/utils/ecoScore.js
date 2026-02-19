const calculateEcoScore = (totalEmission) => {
  /*
    Eco Score Logic:
    Lower emission = Higher score

    Example Formula:
    0 kg → 100 score
    20 kg → 0 score

    We scale linearly.
  */

  const maxEmission = 20; // worst daily emission
  let score = 100 - (totalEmission / maxEmission) * 100;

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return Math.round(score);
};

module.exports = calculateEcoScore;
