const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../../gasRefund");

const data = {
  name: "CyberBlastV3Adapter__SSV2",
  type: "UniswapV3AdapterV2",
  factory: "0x57eF21959CF9536483bA6ddB10Ad73E2a06b85ff",
  quoter: "0x273508AeC0144aD26FA62333d535C29BeDB5CF7a",
  defaultFees: [500, 3_000, 10_000],
  gasEstimate: 300000,
  quoterGasLimit: 300000,
};

module.exports = buildModule("CyberBlastV3Adapter__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const cyberBlastV3Adapter__SSV2 = m.contract(
    "UniswapV3AdapterV2",
    [data.name, data.gasEstimate, data.quoterGasLimit, data.quoter, data.factory, data.defaultFees],
    {
      id: data.name,
    }
  );

  m.call(cyberBlastV3Adapter__SSV2, "initialize", [gasRefund], { after: [cyberBlastV3Adapter__SSV2] });

  return { cyberBlastV3Adapter__SSV2 };
});
