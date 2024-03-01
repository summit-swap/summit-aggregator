const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

const data = {
  name: "Thruster10FeeV2Adapter",
  type: "UniswapV2Adapter",
  factory: "0xb4a7d971d0adea1c73198c97d7ab3f9ce4aafa13",
  fee: 10,
  gasEstimate: 120000,
};

module.exports = buildModule("Thruster10FeeV2Adapter", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const thruster10FeeV2Adapter = m.contract("UniswapV2Adapter", [data.name, data.factory, data.fee, data.gasEstimate], {
    id: data.name,
  });

  m.call(thruster10FeeV2Adapter, "initialize", [gasRefund], { after: [thruster10FeeV2Adapter] });

  return { thruster10FeeV2Adapter };
});
