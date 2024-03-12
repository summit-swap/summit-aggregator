const { buildModule } = require("@nomicfoundation/ignition-core");
const SummitRouterV2__SSV2Module = require("./ecosystem/SummitRouterV2");
const AdaptersLinking__SSV2Module = require("./linking/AdaptersLinking");
const SummitOracleV3__SSV2Module = require("./ecosystem/SummitOracleV3");
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
const RouterAdapters__SSV2 = require("./RouterAdapters");

module.exports = buildModule("Root", (m) => {
  m.useModule(SummitRouterV2__SSV2Module);
  m.useModule(AdaptersLinking__SSV2Module);
  m.useModule(SummitOracleV3__SSV2Module);

  m.useModule(ThrusterV3__SSV2Module);
  m.useModule(MonoswapV3__SSV2Module);
  m.useModule(CyberBlastV3__SSV2Module);
  m.useModule(BitconnectV2__SSV2Module);
  m.useModule(BlasterSwapV2__SSV2Module);
  m.useModule(CyberBlastV2__SSV2Module);
  m.useModule(DYORSwapV2__SSV2Module);
  m.useModule(Thruster3FeeV2__SSV2Module);
  m.useModule(Thruster10FeeV2__SSV2Module);
  m.useModule(HyperBlastV2__SSV2Module);

  m.useModule(RouterAdapters__SSV2);

  // TODO, add volume adapter to routerV2
  // TODO: Set initial values for ETH / USDB pricing
});
