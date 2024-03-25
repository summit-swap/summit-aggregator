const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitRouterV2__SSV2_BF1_Module = require("../ecosystem/SummitRouterV2_BF1");

const tokens = [
  "0x0000000000000000000000000000000000000000", // ETH
  "0x4300000000000000000000000000000000000004", // WETH
  "0x4300000000000000000000000000000000000003", // USDB
];

const eN = (n, e) => {
  return ethers.parseUnits(`${n}`, e);
};

const multifier = (price, decOffset = 0) => {
  return eN(price, 12 + decOffset);
};

module.exports = buildModule("SetHopTokenPrices__SSV2", (m) => {
  const { summitRouterV2__SSV2_BF1 } = m.useModule(SummitRouterV2__SSV2_BF1_Module);

  const mults = [
    multifier(3984), // ETH
    multifier(3984), // WETH
    multifier(1), // USDB
  ];

  m.call(summitRouterV2__SSV2_BF1, "setTokenVolumeMultipliers", [tokens, mults]);
});
