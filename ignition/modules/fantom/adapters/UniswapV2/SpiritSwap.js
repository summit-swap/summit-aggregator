const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const data = {
  name: "SpiritSwapAdapter",
  type: "UniswapV2Adapter",
  factory: "0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3",
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("SpiritSwapAdapter", (m) => {
  const spiritSwapAdapter = m.contract("UniswapV2Adapter", [data.name, data.factory, data.fee, data.gasEstimate], {
    id: data.name,
  });
  return { spiritSwapAdapter };
});
