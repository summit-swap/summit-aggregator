const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const hopTokens = require("../../config/hopTokens");
const oracleConfig = require("../../config/oracle");

const networkId = 168587773;

const hopTokensList = Object.values(hopTokens[networkId]);
const gasRefundModule = buildModule("GasRefund", (m) => {
  const deployer = m.getAccount(0);
  const gasRefund = m.contract("GasRefund", [deployer]);

  return { gasRefund };
});

module.exports = buildModule("SummitSwapEcosystem", (m) => {
  const deployer = m.getAccount(0);

  const wNative = m.getParameter("wNative");
  const oracleParams = oracleConfig[networkId];
  console.log({
    wNative,
    hopTokensList,
  });

  const { gasRefund } = m.useModule(gasRefundModule);

  const summitRouter = m.contract("SummitRouter", [[], hopTokensList, deployer, wNative], { after: [gasRefund] });
  const initSummitRouterCall = m.call(summitRouter, "initialize", [gasRefund]);

  const summitPoints = m.contract("SummitPoints", [], { after: [initSummitRouterCall] });
  const initSummitPointsCall = m.call(summitPoints, "initialize", [gasRefund], { after: [summitPoints] });

  const summitReferrals = m.contract("SummitReferrals", [], { after: [initSummitPointsCall] });
  const initSummitReferralsCall = m.call(summitReferrals, "initialize", [gasRefund], { after: [summitReferrals] });

  const summitVolumeAdapter = m.contract("SummitVolumeAdapterV1", [], { after: [initSummitReferralsCall] });
  const initSummitVolumeAdapterCall = m.call(summitVolumeAdapter, "initialize", [gasRefund], {
    after: [summitVolumeAdapter],
  });

  console.log({
    summitRouter,
    oracleParams,
  });

  const summitOracle = m.contract("SummitOracle", [summitRouter, oracleParams.stable, oracleParams.core], {
    after: [initSummitVolumeAdapterCall],
  });

  // Points Contract
  const setVolAdapterCall = m.call(summitPoints, "setVolumeAdapter", [summitVolumeAdapter], { after: [summitOracle] });
  const setReferralsContractCall = m.call(summitPoints, "setReferralsContract", [summitReferrals], {
    after: [setVolAdapterCall],
  });

  // Referrals Contract
  const setReferralsPointsContractCall = m.call(summitReferrals, "setPointsContract", [summitPoints], {
    after: [setReferralsContractCall],
  });

  // Volume Adapter Contract
  const setRouterCall = m.call(summitVolumeAdapter, "setRouter", [summitRouter], {
    after: [setReferralsPointsContractCall],
  });
  const setVolAdapterPointsContractCall = m.call(summitVolumeAdapter, "setPointsContract", [summitPoints], {
    after: [setRouterCall],
  });

  // Router Contract
  const setRouterVolAdapterCall = m.call(summitRouter, "setVolumeAdapter", [summitVolumeAdapter], {
    after: [setVolAdapterPointsContractCall],
  });

  return { summitPoints, summitReferrals, summitVolumeAdapter };
});
