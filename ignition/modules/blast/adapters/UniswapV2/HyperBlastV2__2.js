const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

const data = {
  name: "HyperBlastV2Adapter",
  type: "UniswapV2AdapterExt",
  factory: "0xd97ffc2041a8ab8f6bc4aee7ee8eca485381d088",
  fee: 2,
  gasEstimate: 120000,
};

module.exports = buildModule("HyperBlastV2Adapter__2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const hyperBlastV2Adapter__2 = m.contract(
    "UniswapV2AdapterExt",
    [data.name, data.factory, data.fee, data.gasEstimate],
    {
      id: data.name,
    }
  );

  m.call(hyperBlastV2Adapter__2, "initialize", [gasRefund], { after: [hyperBlastV2Adapter__2] });

  return { hyperBlastV2Adapter__2 };
});
