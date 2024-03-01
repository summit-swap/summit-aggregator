const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("GasRefund", (m) => {
  const deployer = m.getAccount(0);

  const gasRefund = m.contract("GasRefund", [deployer]);

  return { gasRefund };
});
