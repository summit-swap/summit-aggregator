const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

const data = {
  name: "BitconnectV2Adapter",
  type: "UniswapV2Adapter",
  factory: "0x08938ee323c6da637eff60e854812c16249d4485",
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("BitconnectV2Adapter", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const bitconnectV2Adapter = m.contract("UniswapV2Adapter", [data.name, data.factory, data.fee, data.gasEstimate], {
    id: data.name,
  });

  m.call(bitconnectV2Adapter, "initialize", [gasRefund], { after: [bitconnectV2Adapter] });

  return { bitconnectV2Adapter };
});
