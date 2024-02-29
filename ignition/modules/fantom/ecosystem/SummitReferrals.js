const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitPoints = require("./SummitPoints");

module.exports = buildModule("SummitReferrals", (m) => {
  const { summitPoints } = m.useModule(SummitPoints);
  const summitReferrals = m.contract("SummitReferrals", [], { after: [summitPoints] });
  return { summitReferrals };
});
