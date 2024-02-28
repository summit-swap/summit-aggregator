const boostsAllChains = require("../config/boostedReferrers");

const getReferrerLevelBoosts = async (networkId) => {
  return boostsAllChains[networkId];
};

module.exports.updateReferrerLevelBoosts = async (SummitReferrals, deployer, networkId) => {
  const boosts = await getReferrerLevelBoosts(networkId);

  const boostAddresses = [];
  const boostValues = [];

  Object.entries(boosts).forEach(([address, val]) => {
    boostAddresses.push(address);
    boostValues.push(val);
  });

  await SummitReferrals.connect(deployer).boostReferrers(boostAddresses, boostValues).then(finale);
};

async function finale(res) {
  console.log(`Transaction pending: ${res.hash}`);
  await res.wait();
  console.log("Done! 🎉");
}
