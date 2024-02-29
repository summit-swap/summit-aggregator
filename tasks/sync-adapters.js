const { task } = require("hardhat/config");
const adapters = require("../config/adapters");
const { getDeployedContract } = require("../utils/deploymentFetcher");
const prompt = require("prompt-sync")({ sigint: true });

task(
  "sync-adapters",
  "Updates SummitRouter's adapters according to `deployOptions.json`.'",
  async function (_, hre, _) {
    const networkId = hre.network.config.chainId;
    const [deployer] = await hre.ethers.getSigners();
    const SummitRouter = await getDeployedContract(networkId, "SummitRouter");

    const adapterWhitelist = await getAdapterWhitelist(networkId);
  }
);

const getAdapterWhitelist = async (networkId) => {
  return adapters[networkId];
};
