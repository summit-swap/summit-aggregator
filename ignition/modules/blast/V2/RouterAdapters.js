const { buildModule } = require("@nomicfoundation/ignition-core");
const SummitRouterV2__SSV2Module = require("./ecosystem/SummitRouterV2");
const ThrusterV3__SSV2Module = require("./adapters/UniswapV3/ThrusterV3");
const MonoswapV3__SSV2Module = require("./adapters/UniswapV3/MonoswapV3");
const CyberBlastV3__SSV2Module = require("./adapters/UniswapV3/CyberBlastV3");
const BitconnectV2__SSV2Module = require("./adapters/UniswapV2/BitconnectV2");
const BlasterSwapV2__SSV2Module = require("./adapters/UniswapV2/BlasterSwapV2");
const CyberBlastV2__SSV2Module = require("./adapters/UniswapV2/CyberBlastV2");
const DYORSwapV2__SSV2Module = require("./adapters/UniswapV2/DYORSwapV2");
const Thruster3FeeV2__SSV2Module = require("./adapters/UniswapV2/Thruster3FeeV2");
const Thruster10FeeV2__SSV2Module = require("./adapters/UniswapV2/Thruster10FeeV2");
const HyperBlastV2__SSV2Module = require("./adapters/UniswapV2/HyperBlastV2");
const MonoswapV2__SSV2Module = require("./adapters/UniswapV2/MonoswapV2");

module.exports = buildModule("RouterAdapters__SSV2", (m) => {
  const { summitRouterV2__SSV2 } = m.useModule(SummitRouterV2__SSV2Module);

  const { thrusterV3Adapter__SSV2 } = m.useModule(ThrusterV3__SSV2Module);
  const { monoswapV3Adapter__SSV2 } = m.useModule(MonoswapV3__SSV2Module);
  // const { cyberBlastV3Adapter__SSV2 } = m.useModule(CyberBlastV3__SSV2Module);
  const { bitconnectV2Adapter__SSV2 } = m.useModule(BitconnectV2__SSV2Module);
  const { blasterSwapV2Adapter__SSV2 } = m.useModule(BlasterSwapV2__SSV2Module);
  const { cyberBlastV2Adapter__SSV2 } = m.useModule(CyberBlastV2__SSV2Module);
  const { dyorSwapV2Adapter__SSV2 } = m.useModule(DYORSwapV2__SSV2Module);
  const { thruster3FeeV2Adapter__SSV2 } = m.useModule(Thruster3FeeV2__SSV2Module);
  const { thruster10FeeV2Adapter__SSV2 } = m.useModule(Thruster10FeeV2__SSV2Module);
  const { hyperBlastV2Adapter__SSV2 } = m.useModule(HyperBlastV2__SSV2Module);
  const { monoswapV2Adapter__SSV2 } = m.useModule(MonoswapV2__SSV2Module);

  m.call(summitRouterV2__SSV2, "setAdapters", [
    [
      thrusterV3Adapter__SSV2,
      monoswapV3Adapter__SSV2,
      // cyberBlastV3Adapter__SSV2,
      bitconnectV2Adapter__SSV2,
      blasterSwapV2Adapter__SSV2,
      cyberBlastV2Adapter__SSV2,
      dyorSwapV2Adapter__SSV2,
      thruster3FeeV2Adapter__SSV2,
      thruster10FeeV2Adapter__SSV2,
      hyperBlastV2Adapter__SSV2,
      monoswapV2Adapter__SSV2,
    ],
  ]);

  // TODO, add volume adapter to routerV2
  // TODO: module to update adapters
  // TODO: Set initial values for ETH / USDB pricing
});
