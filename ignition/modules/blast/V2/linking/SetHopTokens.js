const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitRouterV2__SSV2 = require("../ecosystem/SummitRouterV2");

const tokens = [
  "0x4300000000000000000000000000000000000004", // WETH
  "0x4300000000000000000000000000000000000003", // USDB
];

const eN = (n, e) => {
  return ethers.parseUnits(`${n}`, e);
};

const multifier = (price, decOffset = 0) => {
  return eN(price, 12 + decOffset);
};

module.exports = buildModule("SetHopTokens__SSV2", (m) => {
  const { summitRouterV2__SSV2 } = m.useModule(SummitRouterV2__SSV2);

  m.call(summitRouterV2__SSV2, "setTrustedTokens", [tokens, mults]);
});
