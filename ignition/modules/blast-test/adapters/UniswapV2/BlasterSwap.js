const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

const data = {
  name: "BlasterSwapAdapter",
  type: "UniswapV2Adapter",
  factory: "0x281EDF8713d1074E3038c8f68A408d47702D07C8",
  fee: 2,
  gasEstimate: 120000,
};

module.exports = buildModule("BlasterSwapAdapter", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const blasterSwapAdapter = m.contract("UniswapV2Adapter", [data.name, data.factory, data.fee, data.gasEstimate], {
    id: data.name,
  });

  m.call(blasterSwapAdapter, "initialize", [gasRefund], { after: [blasterSwapAdapter] });

  return { blasterSwapAdapter };
});
