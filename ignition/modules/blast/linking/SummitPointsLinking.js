const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitPointsModule = require("../ecosystem/SummitPoints");
const SummitReferralsModule = require("../ecosystem/SummitReferrals");
const SummitVolumeAdapterModule = require("../ecosystem/SummitVolumeAdapter");

module.exports = buildModule("SummitPointsLinking", (m) => {
  const { summitPoints } = m.useModule(SummitPointsModule);
  const { summitReferrals } = m.useModule(SummitReferralsModule);
  const { summitVolumeAdapter } = m.useModule(SummitVolumeAdapterModule);

  // Points Contract
  const setVolAdapterCall = m.call(summitPoints, "setVolumeAdapter", [summitVolumeAdapter]);
  const setReferralsContractCall = m.call(summitPoints, "setReferralsContract", [summitReferrals], {
    after: [setVolAdapterCall],
  });

  return { summitOracle };
});
