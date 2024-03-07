const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitRouterModule = require("./SummitRouter");

const stable = "0x4300000000000000000000000000000000000003";
const wNative = "0x4300000000000000000000000000000000000004";

module.exports = buildModule("SummitOracleV3", (m) => {
  const { summitRouter } = m.useModule(SummitRouterModule);

  const summitOracleV3 = m.contract("SummitOracleV3", [summitRouter, stable, wNative], {
    after: [summitRouter],
  });

  return { summitOracleV3 };
});
