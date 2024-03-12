const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../../gasRefund");

const data = {
  name: "Thruster10FeeV2Adapter__SSV2",
  type: "UniswapV2AdapterV2",
  factory: "0x37836821a2c03c171fB1a595767f4a16e2b93Fc4",
  fee: 10,
  gasEstimate: 120000,
};

module.exports = buildModule("Thruster10FeeV2Adapter__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const thruster10FeeV2Adapter__SSV2 = m.contract(
    "UniswapV2AdapterV2",
    [data.name, data.factory, data.fee, data.gasEstimate],
    {
      id: data.name,
    }
  );

  m.call(thruster10FeeV2Adapter__SSV2, "initialize", [gasRefund], { after: [thruster10FeeV2Adapter__SSV2] });

  return { thruster10FeeV2Adapter__SSV2 };
});
