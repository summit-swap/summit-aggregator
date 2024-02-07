const { task } = require("hardhat/config");

task("list-adapters", "Lists all adapters for the current SummitRouter", async (_, hre) => {
  const SummitRouter = await hre.ethers.getContract("SummitRouter");
  const adapterLen = await SummitRouter.adaptersCount();
  const adapterIndices = Array.from(Array(adapterLen.toNumber()).keys());
  const liveAdapters = await Promise.all(
    adapterIndices.map(async (i) => {
      const adapter = await SummitRouter.ADAPTERS(i);
      const name = await hre.ethers.getContractAt("SummitAdapter", adapter).then((a) => a.name());
      return { adapter, name };
    })
  );
  console.table(liveAdapters);
});
