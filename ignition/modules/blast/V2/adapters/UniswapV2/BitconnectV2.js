const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../../gasRefund");

const data = {
  name: "BitconnectV2Adapter__SSV2",
  type: "UniswapV2AdapterV2",
  factory: "0x08938ee323c6da637eff60e854812c16249d4485",
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("BitconnectV2Adapter__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const bitconnectV2Adapter__SSV2 = m.contract(
    "UniswapV2AdapterV2",
    [data.name, data.factory, data.fee, data.gasEstimate],
    {
      id: data.name,
    }
  );

  m.call(bitconnectV2Adapter__SSV2, "initialize", [gasRefund], { after: [bitconnectV2Adapter__SSV2] });

  return { bitconnectV2Adapter__SSV2 };
});
