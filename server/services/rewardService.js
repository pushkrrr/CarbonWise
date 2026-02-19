const calculateRewards = (totalEmission) => {
  let coins = 5;
  let badge = null;

  if (totalEmission < 4) {
    coins = 20;
    badge = "Eco Champion";
  } else if (totalEmission < 6) {
    coins = 10;
    badge = "Green Starter";
  }

  return { coins, badge };
};

module.exports = calculateRewards;
