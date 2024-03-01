const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../gasRefund");

module.exports = buildModule("SummitReferrals", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const summitReferrals = m.contract("SummitReferrals", [], {
    after: [gasRefund],
  });

  m.call(summitReferrals, "initialize", [gasRefund], { after: [gasRefund, summitReferrals] });

  return { summitReferrals };
});
