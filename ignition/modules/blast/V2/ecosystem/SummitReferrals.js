const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../gasRefund");

module.exports = buildModule("SummitReferrals__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const summitReferrals__SSV2 = m.contract("SummitReferrals", [], {
    after: [gasRefund],
  });

  m.call(summitReferrals__SSV2, "initialize", [gasRefund], { after: [gasRefund, summitReferrals__SSV2] });

  return { summitReferrals__SSV2 };
});
