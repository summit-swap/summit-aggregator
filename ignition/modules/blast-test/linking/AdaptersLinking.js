const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitRouterModule = require("../ecosystem/SummitRouter");
const BlasterSwapAdapterModule = require("../adapters/UniswapV2/BlasterSwap");

module.exports = buildModule("AdaptersLinking", (m) => {
  const { summitRouter } = m.useModule(SummitRouterModule);
  const { blasterSwapAdapter } = m.useModule(BlasterSwapAdapterModule);

  m.call(summitRouter, "setAdapters", [[blasterSwapAdapter]]);

  return { summitRouter, blasterSwapAdapter };
});
