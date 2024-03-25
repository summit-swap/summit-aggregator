const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");
const SummitRouterV2__SSV2_BF1_Module = require("../ecosystem/SummitRouterV2_BF1");
const SummitVolumeAdapterModule = require("../../ecosystem/SummitVolumeAdapter");

module.exports = buildModule("EcosystemLinking_BF1", (m) => {
  const { summitRouterV2__SSV2_BF1 } = m.useModule(SummitRouterV2__SSV2_BF1_Module);
  const { summitVolumeAdapter } = m.useModule(SummitVolumeAdapterModule);

  const setRouterCall = m.call(summitVolumeAdapter, "setRouter", [summitRouterV2__SSV2_BF1]);
  const setVolumeAdapterCall = m.call(summitRouterV2__SSV2_BF1, "setVolumeAdapter", [summitVolumeAdapter], {
    after: [setRouterCall],
  });
});
