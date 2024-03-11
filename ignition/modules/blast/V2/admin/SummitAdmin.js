const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");
const summitRouterModule = require("../ecosystem/SummitRouterV2");
const summitReferralsModule = require("../ecosystem/SummitReferrals");
const summitPointsModule = require("../ecosystem/SummitPoints");

const kuo = "0xCbb68AFF327d16260C23f1F1902F25330Ca4CC6b";
const yankee = "0x5898AC9B7C95eACF22222e4e51ed5EFC9cf6A045";
const ccn = "0xd61984812038D1BE0A185373d48074299f369b66";
const derteil = "0xD2C18781f0dAe6eD8FAcF3c6E3C8f2E7f5313Bb3";

module.exports = buildModule("SummitAdmin__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);
  const { summitRouter } = m.useModule(summitRouterModule);
  const { summitReferrals } = m.useModule(summitReferralsModule);
  const { summitPoints } = m.useModule(summitPointsModule);

  const summitAdmin__SSV2 = m.contract("SummitAdmin", [summitRouter, summitReferrals, summitPoints], {
    after: [summitRouter, summitReferrals, summitPoints],
  });

  const initializeCall = m.call(summitAdmin__SSV2, "initialize", [gasRefund], {
    after: [gasRefund, summitAdmin__SSV2],
  });

  const routerAddMaintainerCall = m.call(summitRouter, "addMaintainer", [summitAdmin__SSV2], {
    after: [summitRouter, initializeCall],
  });

  const addKuoCall = m.call(summitAdmin__SSV2, "addMaintainer", [kuo], {
    id: "addKuo",
    after: [routerAddMaintainerCall],
  });
  const addYankeeCall = m.call(summitAdmin__SSV2, "addMaintainer", [yankee], { id: "addYankee", after: [addKuoCall] });
  const addCcnCall = m.call(summitAdmin__SSV2, "addMaintainer", [ccn], { id: "addCcn", after: [addYankeeCall] });
  const addDerteilCall = m.call(summitAdmin__SSV2, "addMaintainer", [derteil], {
    id: "addDerteil",
    after: [addCcnCall],
  });

  const referralsAddMaintainerCall = m.call(summitReferrals, "addMaintainer", [summitAdmin__SSV2], {
    after: [summitReferrals, addDerteilCall],
  });

  const pointsAddMaintainerCall = m.call(summitPoints, "addMaintainer", [summitAdmin__SSV2], {
    after: [summitPoints, referralsAddMaintainerCall],
  });

  return { summitRouter };
});
