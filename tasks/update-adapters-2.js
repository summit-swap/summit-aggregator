const { task } = require("hardhat/config");
const { getDeployedContract } = require("../utils/deploymentFetcher");
const { updateAdapters } = require("../utils/adapters");

task("update-adapters-2", "Updates the whitelisted adapters", async (_, hre) => {
  const networkId = hre.network.config.chainId;
  const [deployer] = await hre.ethers.getSigners();
  const SummitRouter = await getDeployedContract(networkId, "SummitRouter");

  await updateAdapters(SummitRouter, deployer, networkId);
});
