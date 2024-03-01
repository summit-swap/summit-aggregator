const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

const data = {
  name: "MonoswapV2Adapter",
  type: "UniswapV2Adapter",
  factory: "0xeb7adbef26f615EBFfAdfAdff39dBe52E4613F41",
  fee: 2,
  gasEstimate: 120000,
};

module.exports = buildModule("MonoswapV2Adapter", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const monoswapV2Adapter = m.contract("UniswapV2Adapter", [data.name, data.factory, data.fee, data.gasEstimate], {
    id: data.name,
  });

  m.call(monoswapV2Adapter, "initialize", [gasRefund], { after: [monoswapV2Adapter] });

  return { monoswapV2Adapter };
});
