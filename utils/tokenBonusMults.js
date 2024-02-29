const tokenBonusMultipliers = require("../config/tokenBonusMultipliers");

const getTokenBonusMultipliers = async (networkId) => {
  return tokenBonusMultipliers[networkId];
};

module.exports.logExistingTokenBonusMultipliers = async (SummitRouter, networkId) => {
  const tokensAndBonuses = await getTokenBonusMultipliers(networkId);

  const tokens = [];
  const bonuses = [];

  Object.entries(tokensAndBonuses).forEach(([address, val]) => {
    tokens.push(address);
    bonuses.push(val);
  });

  console.log({
    tokens,
  });

  const res = await Promise.all(tokens.map((token) => SummitRouter.TOKEN_VOLUME_BONUS(token)));
  console.log({
    res,
  });
};

module.exports.updateTokenBonusMultipliers = async (SummitRouter, deployer, networkId) => {
  const tokensAndBonuses = await getTokenBonusMultipliers(networkId);

  const tokens = [];
  const bonuses = [];

  Object.entries(tokensAndBonuses).forEach(([address, val]) => {
    tokens.push(address);
    bonuses.push(val);
  });

  await SummitRouter.connect(deployer).setTokenBonusMultipliers(tokens, bonuses).then(finale);
};

async function finale(res) {
  console.log(`Transaction pending: ${res.hash}`);
  await res.wait();
  console.log("Done! 🎉");
}
