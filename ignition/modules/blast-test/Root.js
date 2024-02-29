const { buildModule } = require("@nomicfoundation/ignition-core");
const SummitVolumeAdapterLinkingModule = require("./linking/SummitVolumeAdapterLinking");

module.exports = buildModule("Root", (m) => {
  m.useModule(SummitVolumeAdapterLinkingModule);
});
