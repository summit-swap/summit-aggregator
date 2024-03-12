const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../../gasRefund");

const data = {
  name: "DYORSwapV2Adapter__SSV2",
  type: "UniswapV2AdapterV2",
  factory: "0xA1da7a7eB5A858da410dE8FBC5092c2079B58413",
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("DYORSwapV2Adapter__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const dyorSwapV2Adapter__SSV2 = m.contract(
    "UniswapV2AdapterV2",
    [data.name, data.factory, data.fee, data.gasEstimate],
    {
      id: data.name,
    }
  );

  m.call(dyorSwapV2Adapter__SSV2, "initialize", [gasRefund], { after: [dyorSwapV2Adapter__SSV2] });

  return { dyorSwapV2Adapter__SSV2 };
});
