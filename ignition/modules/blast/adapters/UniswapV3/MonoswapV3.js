const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

const data = {
  name: "MonoswapV3Adapter",
  type: "UniswapV3Adapter",
  factory: "0x48d0F09710794313f33619c95147F34458BF7C3b",
  quoter: "0x29eb40F0A3522C2Baf4346803dA3a4d617bA7C96",
  defaultFees: [500, 3_000, 10_000],
  gasEstimate: 300000,
  quoterGasLimit: 300000,
};

module.exports = buildModule("MonoswapV3Adapter", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const monoswapV3Adapter = m.contract(
    "UniswapV3Adapter",
    [data.name, data.gasEstimate, data.quoterGasLimit, data.quoter, data.factory, data.defaultFees],
    {
      id: data.name,
    }
  );

  m.call(monoswapV3Adapter, "initialize", [gasRefund], { after: [monoswapV3Adapter] });

  return { monoswapV3Adapter };
});
