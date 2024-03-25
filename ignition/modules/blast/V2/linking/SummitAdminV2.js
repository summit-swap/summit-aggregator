const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");
const SummitRouterV2__SSV2 = require("../ecosystem/SummitRouterV2");
const SummitPointsModule = require("../../ecosystem/SummitPoints");
const SummitReferralsModule = require("../../ecosystem/SummitReferrals");

const kuo = "0xCbb68AFF327d16260C23f1F1902F25330Ca4CC6b";
const yankee = "0x5898AC9B7C95eACF22222e4e51ed5EFC9cf6A045";
const ccn = "0xd61984812038D1BE0A185373d48074299f369b66";
const derteil = "0xD2C18781f0dAe6eD8FAcF3c6E3C8f2E7f5313Bb3";

module.exports = buildModule("SummitAdminV2__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);
  const { summitRouterV2__SSV2 } = m.useModule(SummitRouterV2__SSV2);
  const { summitPoints } = m.useModule(SummitPointsModule);
  const { summitReferrals } = m.useModule(SummitReferralsModule);

  const summitAdminV2__SSV2 = m.contract("SummitAdminV2", [summitRouterV2__SSV2, summitReferrals, summitPoints]);
  const initializeCall = m.call(summitAdminV2__SSV2, "initialize", [gasRefund], {
    after: [gasRefund, summitAdminV2__SSV2],
  });

  const routerAddMaintainerCall = m.call(summitRouterV2__SSV2, "addMaintainer", [summitAdminV2__SSV2], {
    after: [summitRouterV2__SSV2, initializeCall],
  });

  const addKuoCall = m.call(summitAdminV2__SSV2, "addMaintainer", [kuo], {
    id: "addKuo",
    after: [routerAddMaintainerCall],
  });
  const addYankeeCall = m.call(summitAdminV2__SSV2, "addMaintainer", [yankee], {
    id: "addYankee",
    after: [addKuoCall],
  });
  const addCcnCall = m.call(summitAdminV2__SSV2, "addMaintainer", [ccn], { id: "addCcn", after: [addYankeeCall] });
  const addDerteilCall = m.call(summitAdminV2__SSV2, "addMaintainer", [derteil], {
    id: "addDerteil",
    after: [addCcnCall],
  });

  const referralsAddMaintainerCall = m.call(summitReferrals, "addMaintainer", [summitAdminV2__SSV2], {
    after: [summitReferrals, addDerteilCall],
  });

  const pointsAddMaintainerCall = m.call(summitPoints, "addMaintainer", [summitAdminV2__SSV2], {
    after: [summitPoints, referralsAddMaintainerCall],
  });

  return { summitAdminV2__SSV2 };
});
