const { buildModule } = require("@nomicfoundation/ignition-core");
const SummitVolumeAdapterLinkingModule = require("./linking/SummitVolumeAdapterLinking");
const SummitOracleModule = require("./ecosystem/SummitOracle");
const MulticallModule = require("./ecosystem/Multicall");
const AdaptersLinkingModule = require("./linking/AdaptersLinking");

module.exports = buildModule("Root", (m) => {
  m.useModule(SummitVolumeAdapterLinkingModule);
  m.useModule(SummitOracleModule);
  m.useModule(MulticallModule);
  m.useModule(AdaptersLinkingModule);
});
