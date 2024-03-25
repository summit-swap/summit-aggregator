const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const wNativeConfig = require("../../../../../config/wNative");
const hopTokensConfig = require("../../../../../config/hopTokens");
const gasRefundModule = require("../../gasRefund");

const networkId = 81457;
const wNative = wNativeConfig[networkId];
const hopTokens = Object.values(hopTokensConfig[networkId]);

module.exports = buildModule("SummitRouterV2__SSV2_BF1", (m) => {
  const deployer = m.getAccount(0);
  const { gasRefund } = m.useModule(gasRefundModule);

  const summitRouterV2__SSV2_BF1 = m.contract("SummitRouterV2", [[], hopTokens, deployer, wNative], {
    after: [gasRefund],
  });

  m.call(summitRouterV2__SSV2_BF1, "initialize", [gasRefund], { after: [gasRefund, summitRouterV2__SSV2_BF1] });

  return { summitRouterV2__SSV2_BF1 };
});
