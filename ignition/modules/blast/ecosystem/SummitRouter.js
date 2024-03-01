const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const wNativeConfig = require("../../../../config/wNative");
const hopTokensConfig = require("../../../../config/hopTokens");
const gasRefundModule = require("../gasRefund");

const networkId = 81457;
const wNative = wNativeConfig[networkId];
const hopTokens = Object.values(hopTokensConfig[networkId]);

module.exports = buildModule("SummitRouter", (m) => {
  const deployer = m.getAccount(0);
  const { gasRefund } = m.useModule(gasRefundModule);

  const summitRouter = m.contract("SummitRouter", [[], hopTokens, deployer, wNative], {
    after: [gasRefund],
  });

  m.call(summitRouter, "initialize", [gasRefund], { after: [gasRefund, summitRouter] });

  return { summitRouter };
});
