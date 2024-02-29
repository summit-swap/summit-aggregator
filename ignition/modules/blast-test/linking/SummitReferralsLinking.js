const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitReferralsModule = require("../ecosystem/SummitReferrals");
const SummitPointsModule = require("../ecosystem/SummitPoints");

module.exports = buildModule("SummitReferralsLinking", (m) => {
  const { summitPoints } = m.useModule(SummitPointsModule);
  const { summitReferrals } = m.useModule(SummitReferralsModule);

  // Referrals Contract
  const setReferralsPointsContractCall = m.call(summitReferrals, "setPointsContract", [summitPoints]);

  return { summitReferrals, summitPoints };
});
