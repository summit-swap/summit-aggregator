const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../gasRefund");
const SummitPointsModule = require("../ecosystem/SummitPoints");
const SummitReferralsModule = require("../ecosystem/SummitReferrals");
const SummitRouterModule = require("../ecosystem/SummitRouter");
const SummitVolumeAdapterModule = require("../ecosystem/SummitVolumeAdapter");

module.exports = buildModule("SummitVolumeAdapterLinking", (m) => {
  const { summitRouter } = m.useModule(SummitRouterModule);
  const { summitPoints } = m.useModule(SummitPointsModule);
  const { summitReferrals } = m.useModule(SummitReferralsModule);
  const { summitVolumeAdapter } = m.useModule(SummitVolumeAdapterModule);

  const setRouterCall = m.call(summitVolumeAdapter, "setRouter", [summitRouter]);
  const setVolAdapterPointsContractCall = m.call(summitVolumeAdapter, "setPointsContract", [summitPoints], {
    after: [setRouterCall],
  });

  return { summitRouter, summitPoints, summitReferrals, summitVolumeAdapter };
});
