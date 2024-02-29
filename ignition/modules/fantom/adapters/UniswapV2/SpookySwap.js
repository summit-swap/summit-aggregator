const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SpiritSwap = require("./SpiritSwap");

const data = {
  name: "SpookySwapAdapter",
  type: "UniswapV2Adapter",
  factory: "0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3",
  fee: 2,
  gasEstimate: 120000,
};

module.exports = buildModule("SpookySwapAdapter", (m) => {
  const { spiritSwapAdapter } = m.useModule(SpiritSwap);
  const spookySwapAdapter = m.contract("UniswapV2Adapter", [data.name, data.factory, data.fee, data.gasEstimate], {
    id: data.name,
    after: [spiritSwapAdapter],
  });
  return { spookySwapAdapter };
});
