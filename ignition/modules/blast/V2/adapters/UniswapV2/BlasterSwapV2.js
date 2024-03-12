const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../../gasRefund");

const data = {
  name: "BlasterSwapV2Adapter__SSV2",
  type: "UniswapV2AdapterV2",
  factory: "0x9cc1599d4378ea41d444642d18aa9be44f709ffd",
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("BlasterSwapV2Adapter__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const blasterSwapV2Adapter__SSV2 = m.contract(
    "UniswapV2AdapterV2",
    [data.name, data.factory, data.fee, data.gasEstimate],
    {
      id: data.name,
    }
  );

  m.call(blasterSwapV2Adapter__SSV2, "initialize", [gasRefund], { after: [blasterSwapV2Adapter__SSV2] });

  return { blasterSwapV2Adapter__SSV2 };
});
