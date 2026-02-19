const calculateSummary = (activities) => {
  let totalEmission = 0;
  let totalCoins = 0;

  activities.forEach((a) => {
    totalEmission += a.totalEmission;
    totalCoins += a.coins;
  });

  const avgEmission =
    activities.length > 0
      ? totalEmission / activities.length
      : 0;

  return {
    totalEmission: Number(totalEmission.toFixed(2)),
    averageEmission: Number(avgEmission.toFixed(2)),
    totalCoins,
    daysTracked: activities.length,
  };
};

module.exports = calculateSummary;
