const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../../gasRefund");

const data = {
  name: "MonoswapV2Adapter__SSV2",
  type: "UniswapV2AdapterV2",
  factory: "0xE27cb06A15230A7480d02956a3521E78C5bFD2D0",
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("MonoswapV2Adapter__SSV2__2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const monoswapV2Adapter__SSV2__2 = m.contract(
    "UniswapV2AdapterV2",
    [data.name, data.factory, data.fee, data.gasEstimate],
    {
      id: data.name,
    }
  );

  m.call(monoswapV2Adapter__SSV2__2, "initialize", [gasRefund], { after: [monoswapV2Adapter__SSV2__2] });

  return { monoswapV2Adapter__SSV2__2 };
});
