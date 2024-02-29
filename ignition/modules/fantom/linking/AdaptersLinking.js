const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitRouterModule = require("../ecosystem/SummitRouter");
const SpookySwapModule = require("../adapters/UniswapV2/SpookySwap");
const SpiritSwapModule = require("../adapters/UniswapV2/SpiritSwap");
const SummitVolumeAdapterLinkingModule = require("./SummitVolumeAdapterLinking");

module.exports = buildModule("AdaptersLinking", (m) => {
  const { summitRouter } = m.useModule(SummitRouterModule);
  const { spookySwapAdapter } = m.useModule(SpookySwapModule);
  const { spiritSwapAdapter } = m.useModule(SpiritSwapModule);
  const { setVolAdapterPointsContractCall } = m.useModule(SummitVolumeAdapterLinkingModule);

  m.call(summitRouter, "setAdapters", [[spookySwapAdapter, spiritSwapAdapter]], {
    after: [setVolAdapterPointsContractCall],
  });

  return { summitRouter, spookySwapAdapter, spiritSwapAdapter };
});
