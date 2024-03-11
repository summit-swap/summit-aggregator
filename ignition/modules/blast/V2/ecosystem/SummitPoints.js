const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

module.exports = buildModule("SummitPoints__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const summitPoints__SSV2 = m.contract("SummitPoints", [], {
    after: [gasRefund],
  });

  m.call(summitPoints__SSV2, "initialize", [gasRefund], { after: [gasRefund, summitPoints__SSV2] });

  return { summitPoints__SSV2 };
});
