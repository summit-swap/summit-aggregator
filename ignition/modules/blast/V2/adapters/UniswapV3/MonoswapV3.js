const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../../gasRefund");

const data = {
  name: "MonoswapV3Adapter__SSV2",
  type: "UniswapV3AdapterV2",
  factory: "0x48d0F09710794313f33619c95147F34458BF7C3b",
  quoter: "0x29eb40F0A3522C2Baf4346803dA3a4d617bA7C96",
  defaultFees: [500, 3_000, 10_000],
  gasEstimate: 300000,
  quoterGasLimit: 300000,
};

module.exports = buildModule("MonoswapV3Adapter__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const monoswapV3Adapter__SSV2 = m.contract(
    "UniswapV3AdapterV2",
    [data.name, data.gasEstimate, data.quoterGasLimit, data.quoter, data.factory, data.defaultFees],
    {
      id: data.name,
      gasPrice: 1,
    }
  );

  m.call(monoswapV3Adapter__SSV2, "initialize", [gasRefund], { after: [monoswapV3Adapter__SSV2] });

  return { monoswapV3Adapter__SSV2 };
});
