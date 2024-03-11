const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../../gasRefund");

const data = {
  name: "ThrusterV3Adapter__SSV2",
  type: "UniswapV3AdapterV2",
  factory: "0x71b08f13B3c3aF35aAdEb3949AFEb1ded1016127",
  quoter: "0x273508AeC0144aD26FA62333d535C29BeDB5CF7a",
  defaultFees: [500, 3_000, 10_000],
  gasEstimate: 300000,
  quoterGasLimit: 300000,
};

module.exports = buildModule("ThrusterV3Adapter__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const thrusterV3Adapter__SSV2 = m.contract(
    "UniswapV3AdapterV2",
    [data.name, data.gasEstimate, data.quoterGasLimit, data.quoter, data.factory, data.defaultFees],
    {
      id: data.name,
    }
  );

  m.call(thrusterV3Adapter__SSV2, "initialize", [gasRefund], { after: [thrusterV3Adapter__SSV2] });

  return { thrusterV3Adapter__SSV2 };
});
