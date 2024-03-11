const { buildModule } = require("@nomicfoundation/ignition-core");
const SummitRouterV2__SSV2Module = require("./ecosystem/SummitRouterV2");
const AdaptersLinking__SSV2Module = require("./linking/AdaptersLinking");
const SummitOracleV3__SSV2Module = require("./ecosystem/SummitOracleV3");
const ThrusterV3__SSV2Module = require("./adapters/UniswapV3/ThrusterV3");

module.exports = buildModule("Root", (m) => {
  m.useModule(SummitRouterV2__SSV2Module);
  m.useModule(AdaptersLinking__SSV2Module);
  m.useModule(SummitOracleV3__SSV2Module);

  m.useModule(ThrusterV3__SSV2Module);
});
