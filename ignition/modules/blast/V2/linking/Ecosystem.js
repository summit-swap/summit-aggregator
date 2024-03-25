const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");
const SummitRouterV2__SSV2 = require("../ecosystem/SummitRouterV2");
const SummitVolumeAdapterModule = require("../../ecosystem/SummitVolumeAdapter");

module.exports = buildModule("EcosystemLinking", (m) => {
  const { summitRouterV2__SSV2 } = m.useModule(SummitRouterV2__SSV2);
  const { summitVolumeAdapter } = m.useModule(SummitVolumeAdapterModule);

  const setRouterCall = m.call(summitVolumeAdapter, "setRouter", [summitRouterV2__SSV2]);
  const setVolumeAdapterCall = m.call(summitRouterV2__SSV2, "setVolumeAdapter", [summitVolumeAdapter], {
    after: [setRouterCall],
  });
});
