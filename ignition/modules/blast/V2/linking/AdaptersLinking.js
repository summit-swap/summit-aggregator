const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitRouterV2__SSV2Module = require("../ecosystem/SummitRouterV2");
const HyperBlastV2__SSV2Module = require("../adapters/UniswapV2/HyperBlastV2");

module.exports = buildModule("AdaptersLinking__SSV2", (m) => {
  const { summitRouterV2__SSV2 } = m.useModule(SummitRouterV2__SSV2Module);

  const { hyperBlastV2Adapter__SSV2 } = m.useModule(HyperBlastV2__SSV2Module);

  m.call(summitRouterV2__SSV2, "setAdapters", [[hyperBlastV2Adapter__SSV2]]);

  return { summitRouterV2__SSV2 };
});
