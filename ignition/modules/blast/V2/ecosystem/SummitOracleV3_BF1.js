const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitRouterV2__SSV2_BF1_Module = require("./SummitRouterV2_BF1");

const stable = "0x4300000000000000000000000000000000000003";
const wNative = "0x4300000000000000000000000000000000000004";

module.exports = buildModule("SummitOracleV3__SSV2_BF1", (m) => {
  const { summitRouterV2__SSV2_BF1 } = m.useModule(SummitRouterV2__SSV2_BF1_Module);

  const summitOracleV3__SSV2_BF1 = m.contract("SummitOracleV3", [summitRouterV2__SSV2_BF1, stable, wNative], {
    after: [summitRouterV2__SSV2_BF1],
  });

  return { summitOracleV3__SSV2_BF1 };
});
