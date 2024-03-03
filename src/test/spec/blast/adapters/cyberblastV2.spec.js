const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../gasRefund");

const data = {
  name: "CyberBlastV2Adapter",
  type: "UniswapV2Adapter",
  factory: "0x32132625Cd02988Fb105FbbD3138bD383df3aF65",
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("CyberBlastV2Adapter", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const cyberBlastV2Adapter = m.contract("UniswapV2Adapter", [data.name, data.factory, data.fee, data.gasEstimate], {
    id: data.name,
  });

  m.call(cyberBlastV2Adapter, "initialize", [gasRefund], { after: [cyberBlastV2Adapter] });

  return { cyberBlastV2Adapter };
});
