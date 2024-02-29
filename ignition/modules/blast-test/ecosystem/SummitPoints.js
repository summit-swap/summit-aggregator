const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../gasRefund");

module.exports = buildModule("SummitPoints", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const summitPoints = m.contract("SummitPoints", [], {
    after: [gasRefund],
  });

  m.call(summitPoints, "initialize", [gasRefund], { after: [gasRefund, summitPoints] });

  return { summitPoints };
});
