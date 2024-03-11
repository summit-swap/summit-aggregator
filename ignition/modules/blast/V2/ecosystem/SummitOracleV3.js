const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitRouterV2__SSV2Module = require("./SummitRouterV2");

const stable = "0x4300000000000000000000000000000000000003";
const wNative = "0x4300000000000000000000000000000000000004";

module.exports = buildModule("SummitOracleV3__SSV2", (m) => {
  const { summitRouterV2__SSV2 } = m.useModule(SummitRouterV2__SSV2Module);

  const summitOracleV3__SSV2 = m.contract("SummitOracleV3", [summitRouterV2__SSV2, stable, wNative], {
    after: [summitRouterV2__SSV2],
  });

  return { summitOracleV3__SSV2 };
});
