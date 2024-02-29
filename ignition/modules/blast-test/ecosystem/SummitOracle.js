const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitRouterModule = require("./SummitRouter");

const stable = "0xda9C093a7D9e41d21Dc9A7ff5601A3FD02111d95";
const wNative = "0x4200000000000000000000000000000000000023";

module.exports = buildModule("SummitOracle", (m) => {
  const { summitRouter } = m.useModule(SummitRouterModule);

  const summitOracle = m.contract("SummitOracle", [summitRouter, stable, wNative], {
    after: [summitRouter],
  });

  return { summitOracle };
});
