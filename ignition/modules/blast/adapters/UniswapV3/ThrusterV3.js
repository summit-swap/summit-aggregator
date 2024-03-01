const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

const data = {
  name: "ThrusterV3Adapter",
  type: "UniswapV3Adapter",
  factory: "0x37836821a2c03c171fb1a595767f4a16e2b93fc4",
  quoter: "0x3b299f65b47c0bfaeff715bc73077ba7a0a685be",
  defaultFees: [500, 3_000, 10_000],
  gasEstimate: 300000,
  quoterGasLimit: 300000,
};

module.exports = buildModule("ThrusterV3Adapter", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const thrusterV3Adapter = m.contract(
    "UniswapV3Adapter",
    [data.name, data.gasEstimate, data.quoterGasLimit, data.quoter, data.factory, data.defaultFees],
    {
      id: data.name,
    }
  );

  m.call(thrusterV3Adapter, "initialize", [gasRefund], { after: [thrusterV3Adapter] });

  return { thrusterV3Adapter };
});
