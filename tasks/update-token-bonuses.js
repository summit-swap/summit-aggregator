const { task } = require("hardhat/config");
const { getDeployedContract } = require("../utils/deploymentFetcher");
const { updateTokenBonusMultipliers, logExistingTokenBonusMultipliers } = require("../utils/tokenBonusMults");

task("update-token-bonuses", "Updates the boost level of selected tokens", async (_, hre) => {
  const networkId = hre.network.config.chainId;
  const [deployer] = await hre.ethers.getSigners();
  const SummitRouter = await getDeployedContract(networkId, "SummitRouter");

  await logExistingTokenBonusMultipliers(SummitRouter, networkId);

  await updateTokenBonusMultipliers(SummitRouter, deployer, networkId);
});
