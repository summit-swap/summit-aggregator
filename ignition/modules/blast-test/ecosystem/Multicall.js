const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Multicall", (m) => {
  const multicall = m.contract("Multicall", []);

  return { multicall };
});
