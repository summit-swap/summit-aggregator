const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("UniV3StaticQuoter", (m) => {
  const uniswapV3StaticQuoter = m.contract("UniswapV3StaticQuoter", []);
  return { uniswapV3StaticQuoter };
});
