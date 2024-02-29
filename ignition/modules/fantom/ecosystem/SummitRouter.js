const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const wNativeConfig = require("../../../../config/wNative");
const hopTokensConfig = require("../../../../config/hopTokens");
const SummitReferrals = require("./SummitReferrals");

const networkId = 250;
const wNative = wNativeConfig[networkId];
const hopTokens = Object.values(hopTokensConfig[networkId]);

module.exports = buildModule("SummitRouter", (m) => {
  const { summitReferrals } = m.useModule(SummitReferrals);

  const deployer = m.getAccount(0);
  const summitRouter = m.contract("SummitRouter", [[], hopTokens, deployer, wNative], {
    after: [summitReferrals],
  });
  return { summitRouter };
});
