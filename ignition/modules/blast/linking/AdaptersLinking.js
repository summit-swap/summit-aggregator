const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitRouterModule = require("../ecosystem/SummitRouter");

const cyberBlastV2Module = require("../adapters/UniswapV2/CyberBlastV2");
const dyorSwapV2Module = require("../adapters/UniswapV2/DYORSwapV2");
const monoswapV2Module = require("../adapters/UniswapV2/MonoswapV2");
const thruster3FeeV2Module = require("../adapters/UniswapV2/Thruster3FeeV2");
const thruster10FeeV2Module = require("../adapters/UniswapV2/Thruster10FeeV2");
const monoswapV3Module = require("../adapters/UniswapV3/MonoswapV3");
const thrusterV3Module = require("../adapters/UniswapV3/ThrusterV3");

module.exports = buildModule("AdaptersLinking", (m) => {
  const { summitRouter } = m.useModule(SummitRouterModule);

  const { cyberBlastV2Adapter } = m.useModule(cyberBlastV2Module);
  const { dyorSwapV2Adapter } = m.useModule(dyorSwapV2Module);
  const { monoswapV2Adapter } = m.useModule(monoswapV2Module);
  const { thruster3FeeV2Adapter } = m.useModule(thruster3FeeV2Module);
  const { thruster10FeeV2Adapter } = m.useModule(thruster10FeeV2Module);
  const { monoswapV3Adapter } = m.useModule(monoswapV3Module);
  const { thrusterV3Adapter } = m.useModule(thrusterV3Module);

  m.call(summitRouter, "setAdapters", [
    [
      cyberBlastV2Adapter,
      dyorSwapV2Adapter,
      monoswapV2Adapter,
      thruster3FeeV2Adapter,
      thruster10FeeV2Adapter,
      monoswapV3Adapter,
      thrusterV3Adapter,
    ],
  ]);

  return { summitRouter };
});
