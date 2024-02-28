const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { addresses } = require("../../src/deploy/utils");
const networkName = "fantom";
const deployOptions = require("../../src/misc/deployOptions")[networkName];

const spookySwapData = {
  name: "SpookySwapAdapter",
  factory: addresses.fantom.univ2.factories.spooky,
  fee: 2,
  gasEstimate: 120000,
};

const spiritSwapData = {
  name: "SpiritSwapAdapter",
  factory: addresses.fantom.univ2.factories.spirit,
  fee: 3,
  gasEstimate: 120000,
};

module.exports = buildModule("SummitSwapEcosystem", (m) => {
  const deployer = m.getAccount(0);

  const spiritSwapAdapter = m.contract(
    "UniswapV2Adapter",
    [spiritSwapData.name, spiritSwapData.factory, spiritSwapData.fee, spiritSwapData.gasEstimate],
    { id: spiritSwapData.name }
  );

  const spookySwapAdapter = m.contract(
    "UniswapV2Adapter",
    [spookySwapData.name, spookySwapData.factory, spookySwapData.fee, spookySwapData.gasEstimate],
    { id: spookySwapData.name, after: [spiritSwapAdapter] }
  );

  const summitRouter = m.contract(
    "SummitRouter",
    [[spookySwapAdapter, spiritSwapAdapter], deployOptions.hopTokens, deployer, deployOptions.wnative],
    {
      after: [spookySwapAdapter, spiritSwapAdapter],
    }
  );

  const summitPoints = m.contract("SummitPoints", [], { after: [summitRouter] });
  const initSummitPointsCall = m.call(summitPoints, "initialize", [deployer], { after: [summitPoints] });

  const summitReferrals = m.contract("SummitReferrals", [], { after: [initSummitPointsCall] });
  const initSummitReferralsCall = m.call(summitReferrals, "initialize", [deployer], { after: [summitReferrals] });

  const summitVolumeAdapter = m.contract("SummitVolumeAdapterV1", [], { after: [initSummitReferralsCall] });
  const initSummitVolumeAdapterCall = m.call(summitVolumeAdapter, "initialize", [deployer], {
    after: [summitVolumeAdapter],
  });

  const summitOracle = m.contract("SummitOracle", [summitRouter, deployOptions.oracle.stable, deployOptions.wnative], {
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
