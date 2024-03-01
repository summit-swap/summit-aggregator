const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../gasRefund");

module.exports = buildModule("SummitVolumeAdapter", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const summitVolumeAdapter = m.contract("SummitVolumeAdapterV1", [], {
    after: [gasRefund],
  });

  m.call(summitVolumeAdapter, "initialize", [gasRefund], { after: [gasRefund, summitVolumeAdapter] });

  return { summitVolumeAdapter };
});
