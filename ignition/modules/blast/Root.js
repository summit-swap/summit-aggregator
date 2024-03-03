const { buildModule } = require("@nomicfoundation/ignition-core");
const SummitVolumeAdapterLinkingModule = require("./linking/SummitVolumeAdapterLinking");
const SummitOracleModule = require("./ecosystem/SummitOracle");
const MulticallModule = require("./ecosystem/Multicall");
const AdaptersLinkingModule = require("./linking/AdaptersLinking");
const UniV3StaticQuoterModule = require("./quoters/UniV3StaticQuoter");
const ThrusterV3__2Module = require("./adapters/UniswapV3/ThrusterV3__2");
const MonoswapV2__2Module = require("./adapters/UniswapV2/MonoswapV2__2");
const Thruster10FeeV2__2Module = require("./adapters/UniswapV2/Thruster10FeeV2__2");
const SummitAdminModule = require("./admin/SummitAdmin");

module.exports = buildModule("Root", (m) => {
  m.useModule(SummitVolumeAdapterLinkingModule);
  m.useModule(SummitOracleModule);
  m.useModule(MulticallModule);
  m.useModule(AdaptersLinkingModule);
  m.useModule(UniV3StaticQuoterModule);

  m.useModule(ThrusterV3__2Module);
  m.useModule(MonoswapV2__2Module);
  m.useModule(Thruster10FeeV2__2Module);

  m.useModule(SummitAdminModule);
});
