const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitRouterModule = require("./SummitRouter");

const stable = "0x28a92dde19d9989f39a49905d7c9c2fac7799bdf";
const wNative = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";

module.exports = buildModule("SummitOracle", (m) => {
  const { summitRouter } = m.useModule(SummitRouterModule);

  const summitOracle = m.contract("SummitOracle", [summitRouter, stable, wNative], {
    after: [summitRouter],
  });

  return { summitOracle };
});
