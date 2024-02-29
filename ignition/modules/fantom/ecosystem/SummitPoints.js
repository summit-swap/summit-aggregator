const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SpookySwap = require("../adapters/UniswapV2/SpookySwap");

module.exports = buildModule("SummitPoints", (m) => {
  const { spookySwapAdapter } = m.useModule(SpookySwap);
  const summitPoints = m.contract("SummitPoints", [], { after: [spookySwapAdapter] });
  return { summitPoints };
});
