const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

const data = {
  name: "DYORSwapV2Adapter",
  type: "UniswapV2Adapter",
  factory: "0xA1da7a7eB5A858da410dE8FBC5092c2079B58413",
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("DYORSwapV2Adapter", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const dyorSwapV2Adapter = m.contract("UniswapV2Adapter", [data.name, data.factory, data.fee, data.gasEstimate], {
    id: data.name,
  });

  m.call(dyorSwapV2Adapter, "initialize", [gasRefund], { after: [dyorSwapV2Adapter] });

  return { dyorSwapV2Adapter };
});
