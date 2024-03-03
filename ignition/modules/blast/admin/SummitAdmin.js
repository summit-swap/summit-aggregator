const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../gasRefund");
const summitRouterModule = require("../ecosystem/SummitRouter");
const summitReferralsModule = require("../ecosystem/SummitReferrals");
const summitPointsModule = require("../ecosystem/SummitPoints");

const kuo = "0xCbb68AFF327d16260C23f1F1902F25330Ca4CC6b";
const yankee = "";
const ccn = "";
const derteil = "";

module.exports = buildModule("SummitAdmin", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);
  const { summitRouter } = m.useModule(summitRouterModule);
  const { summitReferrals } = m.useModule(summitReferralsModule);
  const { summitPoints } = m.useModule(summitPointsModule);

  const summitAdmin = m.contract("SummitAdmin", [summitRouter, summitReferrals, summitPoints], {
    after: [summitRouter, summitReferrals, summitPoints],
  });

  const initializeCall = m.call(summitAdmin, "initialize", [gasRefund], { after: [gasRefund, summitAdmin] });

  const addKuoCall = m.call(summitAdmin, "addMaintainer", [kuo], { after: [initializeCall] });
  const addYankeeCall = m.call(summitAdmin, "addMaintainer", [yankee], { after: [addKuoCall] });
  const addCcnCall = m.call(summitAdmin, "addMaintainer", [ccn], { after: [addYankeeCall] });
  const addDerteilCall = m.call(summitAdmin, "addMaintainer", [derteil], { after: [addCcnCall] });

  return { summitRouter };
});
