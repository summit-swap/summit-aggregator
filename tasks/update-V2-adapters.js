const { task } = require("hardhat/config");
const { getDeployedContract } = require("../utils/deploymentFetcher");
const { updateAdapters } = require("../utils/adapters");

task("update-V2-adapters", "Updates the whitelisted adapters", async (_, hre) => {
  const networkId = hre.network.config.chainId;
  const [deployer] = await hre.ethers.getSigners();

  const isV2 = true;

  const SummitRouterV2 = await getDeployedContract(networkId, "SummitRouterV2", isV2);

  console.log({
    SummitRouterV2,
  });

  await updateAdapters(SummitRouterV2, deployer, networkId, isV2);
});
