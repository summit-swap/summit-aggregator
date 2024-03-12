const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../../gasRefund");

const data = {
  name: "Thruster3FeeV2Adapter__SSV2",
  type: "UniswapV2AdapterV2",
  factory: "0xb4a7d971d0adea1c73198c97d7ab3f9ce4aafa13",
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("Thruster3FeeV2Adapter__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const thruster3FeeV2Adapter__SSV2 = m.contract(
    "UniswapV2AdapterV2",
    [data.name, data.factory, data.fee, data.gasEstimate],
    {
      id: data.name,
    }
  );

  m.call(thruster3FeeV2Adapter__SSV2, "initialize", [gasRefund], { after: [thruster3FeeV2Adapter__SSV2] });

  return { thruster3FeeV2Adapter__SSV2 };
});
