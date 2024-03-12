const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const gasRefundModule = require("../../../gasRefund");

const data = {
  name: "CyberBlastV2Adapter__SSV2",
  type: "UniswapV2AdapterV2",
  factory: "0x32132625Cd02988Fb105FbbD3138bD383df3aF65",
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("CyberBlastV2Adapter__SSV2", (m) => {
  const { gasRefund } = m.useModule(gasRefundModule);

  const cyberBlastV2Adapter__SSV2 = m.contract(
    "UniswapV2AdapterV2",
    [data.name, data.factory, data.fee, data.gasEstimate],
    {
      id: data.name,
    }
  );

  m.call(cyberBlastV2Adapter__SSV2, "initialize", [gasRefund], { after: [cyberBlastV2Adapter__SSV2] });

  return { cyberBlastV2Adapter__SSV2 };
});
