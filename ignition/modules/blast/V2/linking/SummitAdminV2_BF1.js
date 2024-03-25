const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");
const SummitRouterV2__SSV2_BF1_Module = require("../ecosystem/SummitRouterV2_BF1");
const SummitPointsModule = require("../../ecosystem/SummitPoints");
const SummitReferralsModule = require("../../ecosystem/SummitReferrals");

const kuo = "0xCbb68AFF327d16260C23f1F1902F25330Ca4CC6b";
const yankee = "0x5898AC9B7C95eACF22222e4e51ed5EFC9cf6A045";
const ccn = "0xd61984812038D1BE0A185373d48074299f369b66";
const derteil = "0x4e6498Fd91fD46c0E1CdC56Ff7d5fcEc054fE76C";

module.exports = buildModule("SummitAdminV2__SSV2_BF1", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);
  const { summitRouterV2__SSV2_BF1 } = m.useModule(SummitRouterV2__SSV2_BF1_Module);
  const { summitPoints } = m.useModule(SummitPointsModule);
  const { summitReferrals } = m.useModule(SummitReferralsModule);

  const summitAdminV2__SSV2_BF1 = m.contract("SummitAdminV2", [
    summitRouterV2__SSV2_BF1,
    summitReferrals,
    summitPoints,
  ]);
  const initializeCall = m.call(summitAdminV2__SSV2_BF1, "initialize", [gasRefund], {
    after: [gasRefund, summitAdminV2__SSV2_BF1],
  });

  const routerAddMaintainerCall = m.call(summitRouterV2__SSV2_BF1, "addMaintainer", [summitAdminV2__SSV2_BF1], {
    after: [summitRouterV2__SSV2_BF1, initializeCall],
  });

  const addKuoCall = m.call(summitAdminV2__SSV2_BF1, "addMaintainer", [kuo], {
    id: "addKuo",
    after: [routerAddMaintainerCall],
  });
  const addYankeeCall = m.call(summitAdminV2__SSV2_BF1, "addMaintainer", [yankee], {
    id: "addYankee",
    after: [addKuoCall],
  });
  const addCcnCall = m.call(summitAdminV2__SSV2_BF1, "addMaintainer", [ccn], { id: "addCcn", after: [addYankeeCall] });
  const addDerteilCall = m.call(summitAdminV2__SSV2_BF1, "addMaintainer", [derteil], {
    id: "addDerteil",
    after: [addCcnCall],
  });

  const referralsAddMaintainerCall = m.call(summitReferrals, "addMaintainer", [summitAdminV2__SSV2_BF1], {
    after: [summitReferrals, addDerteilCall],
  });

  const pointsAddMaintainerCall = m.call(summitPoints, "addMaintainer", [summitAdminV2__SSV2_BF1], {
    after: [summitPoints, referralsAddMaintainerCall],
  });

  return { summitAdminV2__SSV2_BF1 };
});
