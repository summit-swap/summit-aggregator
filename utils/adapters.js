const adaptersAllChain = require("../config/adapters");
const { getDeployedContractAddress } = require("./deploymentFetcher");

const getAdapterConfigs = async (networkId) => {
  return adaptersAllChain[networkId];
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

const getAdapterAddressesFromConfig = async (networkId) => {
  const adapters = await getAdapterConfigs(networkId);
  return Promise.all(
    Object.keys(adapters).map(async (contractName) => getDeployedContractAddress(networkId, contractName))
  );
};

module.exports.updateAdapters = async (SummitRouter, deployer, networkId) => {
  const adapterAddresses = await getAdapterAddressesFromConfig(networkId);

  await SummitRouter.connect(deployer).setAdapters(adapterAddresses).then(finale);
};

async function finale(res) {
  console.log(`Transaction pending: ${res.hash}`);
  await res.wait();
  console.log("Done! 🎉");
}
