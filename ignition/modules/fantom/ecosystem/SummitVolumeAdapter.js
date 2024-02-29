const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const SummitOracle = require("./SummitOracle");

module.exports = buildModule("SummitVolumeAdapter", (m) => {
  const { summitOracle } = m.useModule(SummitOracle);
  const summitVolumeAdapter = m.contract("SummitVolumeAdapterV1", [], { after: [summitOracle] });
  return { summitVolumeAdapter };
});
