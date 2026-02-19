const calculateCarbon = (data) => {
  // Travel
  const carEmission = (data.travel?.carKm || 0) * 0.12;
  const busEmission = (data.travel?.busKm || 0) * 0.04;
  const flightEmission = data.travel?.flight ? 90 : 0;

  // Electricity
  const electricityEmission = (data.electricity?.units || 0) * 0.82;

  // Food
  const vegEmission = (data.food?.vegMeals || 0) * 1.5;
  const nonVegEmission = (data.food?.nonVegMeals || 0) * 6;

  // Lifestyle
  const plasticEmission =
    (data.lifestyle?.plasticUsage || 0) * 0.5;

  const total =
    carEmission +
    busEmission +
    flightEmission +
    electricityEmission +
    vegEmission +
    nonVegEmission +
    plasticEmission;

  return {
    totalEmission: Number(total.toFixed(2)),
  };
};

module.exports = calculateCarbon;
