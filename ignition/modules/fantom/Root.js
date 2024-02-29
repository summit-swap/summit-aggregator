const { buildModule } = require("@nomicfoundation/ignition-core");
const SummitVolumeAdapterLinkingModule = require("./linking/SummitVolumeAdapterLinking");
const SummitOracleModule = require("./ecosystem/SummitOracle");
const AdaptersLinkingModule = require("./linking/AdaptersLinking");

module.exports = buildModule("Root", (m) => {
  m.useModule(SummitVolumeAdapterLinkingModule);
  m.useModule(SummitOracleModule);
  m.useModule(AdaptersLinkingModule);
});
