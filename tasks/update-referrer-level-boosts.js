const { task } = require("hardhat/config");
const { getDeployedContract } = require("../utils/deploymentFetcher");
const { updateReferrerLevelBoosts } = require("../utils/boostedReferrers");

task("update-referrer-level-boosts", "Updates SummitReferrals boosted accounts", async (_, hre) => {
  const networkId = hre.network.config.chainId;
  const [deployer] = await hre.ethers.getSigners();
  const SummitReferrals = await getDeployedContract(networkId, "SummitReferrals");
  await updateReferrerLevelBoosts(SummitReferrals, deployer, networkId);
});
