const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

const data = {
  name: "HyperBlastV2Adapter__3",
  type: "UniswapV2Adapter",
  factory: "0xd97ffc2041a8ab8f6bc4aee7ee8eca485381d088",
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("HyperBlastV2Adapter__3", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const hyperBlastV2Adapter__3 = m.contract("UniswapV2Adapter", [data.name, data.factory, data.fee, data.gasEstimate], {
    id: data.name,
  });

  m.call(hyperBlastV2Adapter__3, "initialize", [gasRefund], { after: [hyperBlastV2Adapter__3] });

  return { hyperBlastV2Adapter__3 };
});
