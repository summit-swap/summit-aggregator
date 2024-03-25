const { buildModule } = require("@nomicfoundation/ignition-core");
const SummitRouterV2__SSV2_BF1_Module = require("./ecosystem/SummitRouterV2_BF1");
const SummitOracleV3__SSV2_BF1_Module = require("./ecosystem/SummitOracleV3_BF1");
const RouterAdapters__SSV2_BF1_Module = require("./RouterAdapters_BF1");
const EcosystemLinkingModule__SSV2_BF1_Module = require("./linking/Ecosystem_BF1");
const SummitAdminV2__SSV2_BF1_Module = require("./linking/SummitAdminV2_BF1");
const SetHopTokenPrices__SSV2_BF1_Module = require("./linking/SetHopTokenPrices_BF1");

// BugFix - correct swap transfer target

module.exports = buildModule("Root", (m) => {
  // m.useModule(SummitRouterV2__SSV2Module);
  // m.useModule(AdaptersLinking__SSV2Module);
  // m.useModule(SummitOracleV3__SSV2Module);

  // m.useModule(ThrusterV3__SSV2Module);
  // m.useModule(MonoswapV3__SSV2Module);
  // m.useModule(CyberBlastV3__SSV2Module);
  // m.useModule(BitconnectV2__SSV2Module);
  // m.useModule(BlasterSwapV2__SSV2Module);
  // m.useModule(CyberBlastV2__SSV2Module);
  // m.useModule(DYORSwapV2__SSV2Module);
  // m.useModule(Thruster3FeeV2__SSV2Module);
  // m.useModule(Thruster10FeeV2__SSV2Module);
  // m.useModule(HyperBlastV2__SSV2Module);
  // m.useModule(MonoswapV2__SSV2Module);

  // m.useModule(EcosystemLinkingModule__SSV2);
  // m.useModule(SummitAdminV2__SSV2Module);

  // m.useModule(SetHopTokenPrices__SSV2Module);

  // m.useModule(RouterAdapters__SSV2);

  // BugFix - correct swap transfer target
  m.useModule(SummitRouterV2__SSV2_BF1_Module);
  m.useModule(SummitOracleV3__SSV2_BF1_Module);
  m.useModule(EcosystemLinkingModule__SSV2_BF1_Module);
  m.useModule(SummitAdminV2__SSV2_BF1_Module);
  m.useModule(SetHopTokenPrices__SSV2_BF1_Module);
  m.useModule(RouterAdapters__SSV2_BF1_Module);
});

// ToDo
// SummitRouterV2__2: deploy
// SummitOracleV3: setRouter
// SummitVolumeAdapterV2: setRouter
// SummitAdminV2: deploy with all fixings
// setHopTokenPrices
// set adapters
