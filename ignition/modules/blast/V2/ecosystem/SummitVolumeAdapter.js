const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../gasRefund");

module.exports = buildModule("SummitVolumeAdapter__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const summitVolumeAdapter__SSV2 = m.contract("SummitVolumeAdapterV1", [], {
    after: [gasRefund],
  });

  m.call(summitVolumeAdapter__SSV2, "initialize", [gasRefund], { after: [gasRefund, summitVolumeAdapter__SSV2] });

  return { summitVolumeAdapter__SSV2 };
});
