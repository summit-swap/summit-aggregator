const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../gasRefund");
const SummitRouterModule = require("../ecosystem/SummitRouter");
const SummitVolumeAdapterModule = require("../ecosystem/SummitVolumeAdapter");

module.exports = buildModule("SummitRouterLinking", (m) => {
  const { summitRouter } = m.useModule(SummitRouterModule);
  const { summitVolumeAdapter } = m.useModule(SummitVolumeAdapterModule);

  // Router Contract
  const setRouterVolAdapterCall = m.call(summitRouter, "setVolumeAdapter", [summitVolumeAdapter]);

  return { summitRouter, summitPoints, summitVolumeAdapter };
});
