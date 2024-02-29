const { task } = require("hardhat/config");
const { getDeployedContract } = require("../utils/deploymentFetcher");
const { updateReferrerLevelBoosts } = require("../utils/boostedReferrers");

task("check-bal", "Checkin in on blast", async (_, hre) => {
  const networkId = hre.network.config.chainId;
  const [deployer] = await hre.ethers.getSigners();
  console.log({
    deployer,
  });
  const contractBalance = await ethers.provider.getBalance(deployer.address);
  console.log({
    contractBalance,
  });
});
