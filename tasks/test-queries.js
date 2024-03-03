const { task } = require("hardhat/config");
const { getDeployedContract } = require("../utils/deploymentFetcher");
const { updateAdapters } = require("../utils/adapters");
const AdapterAbi = require("../src/abis/IAdapter.json");
const tokens = require("../config/tokens")[81457];

const ANDY = "0xd43d8adac6a4c7d9aeece7c3151fca8f23752cf8";

task("test-queries", "Test queries against a few adapters, find which is best", async (_, hre) => {
  const networkId = hre.network.config.chainId;
  const [deployer] = await hre.ethers.getSigners();
  const SummitRouter = await getDeployedContract(networkId, "SummitRouter");

  console.log(ethers);

  const tradeArgs = [ethers.parseUnits("1"), tokens.WETH, ANDY];

  const adaptersCount = parseInt(await SummitRouter.adaptersCount());
  const adapters = await Promise.all(new Array(adaptersCount).fill("").map((_, i) => SummitRouter.ADAPTERS(i)));

  const adapterContracts = await Promise.all(
    adapters.map((adapter) => {
      return ethers.getContractAt(AdapterAbi, adapter);
    })
  );

  const adapterNames = await Promise.all(adapterContracts.map((contract) => contract.name()));

  const adapterQuery = await Promise.all(
    new Array(adaptersCount).fill("").map((_, i) => {
      return SummitRouter.queryAdapter(...tradeArgs, i);
    })
  );

  const bestPath = await SummitRouter.findBestPath(...tradeArgs, 3);

  console.log({
    bestPath,
    adaptersCount,
    adapterQuery,
    adapterNames,
    adapters,
    adapt: new Array(adaptersCount).fill("").map((_, i) => i),
  });
});
