const adaptersAllChain = require("../config/adapters");
const adaptersV2AllChain = require("../config/V2adapters");
const { getDeployedContractAddress } = require("./deploymentFetcher");

const getAdapterConfigs = async (networkId, isV2) => {
  if (isV2) return adaptersV2AllChain[networkId];
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

const getAdapterAddressesFromConfig = async (networkId, isV2) => {
  const adapters = await getAdapterConfigs(networkId, isV2);

  console.log({
    adapters,
  });

  return Promise.all(
    Object.keys(adapters).map(async (contractName) => getDeployedContractAddress(networkId, contractName, isV2))
  );
};

module.exports.updateAdapters = async (SummitRouter, deployer, networkId, isV2) => {
  const adapterAddresses = await getAdapterAddressesFromConfig(networkId, isV2);

  console.log({ adapterAddresses });

  await SummitRouter.connect(deployer).setAdapters(adapterAddresses).then(finale);
};

async function finale(res) {
  console.log(`Transaction pending: ${res.hash}`);
  await res.wait();
  console.log("Done! 🎉");
}
