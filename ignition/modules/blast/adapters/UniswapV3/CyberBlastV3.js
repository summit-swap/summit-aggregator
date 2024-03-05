const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

const data = {
  name: "CyberBlastV3Adapter",
  type: "UniswapV3Adapter",
  factory: "0x57eF21959CF9536483bA6ddB10Ad73E2a06b85ff",
  quoter: "0x273508AeC0144aD26FA62333d535C29BeDB5CF7a",
  defaultFees: [500, 3_000, 10_000],
  gasEstimate: 300000,
  quoterGasLimit: 300000,
};

module.exports = buildModule("CyberBlastV3Adapter", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const cyberBlastV3Adapter = m.contract(
    "UniswapV3Adapter",
    [data.name, data.gasEstimate, data.quoterGasLimit, data.quoter, data.factory, data.defaultFees],
    {
      id: data.name,
    }
  );

  m.call(cyberBlastV3Adapter, "initialize", [gasRefund], { after: [cyberBlastV3Adapter] });

  return { cyberBlastV3Adapter };
});
