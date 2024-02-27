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

const SpookySwapAdapterModule = buildModule("SpookySwapAdapter", (m) => {
  const spookySwapAdapter = m.contract(
    "UniswapV2Adapter",
    [spookySwapData.name, spookySwapData.factory, spookySwapData.fee, spookySwapData.gasEstimate],
    { id: spookySwapData.name }
  );

  return { spookySwapAdapter };
});

const SpiritSwapAdapterModule = buildModule("SpiritSwapAdapter", (m) => {
  const spiritSwapAdapter = m.contract(
    "UniswapV2Adapter",
    [spiritSwapData.name, spiritSwapData.factory, spiritSwapData.fee, spiritSwapData.gasEstimate],
    { id: spiritSwapData.name }
  );

  return { spiritSwapAdapter };
});

const SummitRouterModule = buildModule("SummitRouter", (m) => {
  const deployer = m.getAccount(0);
  const { spookySwapAdapter } = m.useModule(SpookySwapAdapterModule);
  const { spiritSwapAdapter } = m.useModule(SpiritSwapAdapterModule);

  const summitRouter = m.contract("SummitRouter", [
    [spookySwapAdapter, spiritSwapAdapter],
    deployOptions.hopTokens,
    deployer,
    deployOptions.wnative,
  ]);

  return { summitRouter };
});

const SummitPointsModule = buildModule("SummitPoints", (m) => {
  const deployer = m.getAccount(0);
  const summitPoints = m.contract("SummitPoints", []);
  m.call(summitPoints, "initialize", [deployer]);
  return { summitPoints };
});

const SummitReferralsModule = buildModule("SummitReferrals", (m) => {
  const deployer = m.getAccount(0);
  const summitReferrals = m.contract("SummitReferrals", []);
  m.call(summitReferrals, "initialize", [deployer]);
  return { summitReferrals };
});

const SummitVolumeAdapterModule = buildModule("SummitVolumeAdapter", (m) => {
  const deployer = m.getAccount(0);
  const summitVolumeAdapter = m.contract("SummitVolumeAdapterV1", []);
  m.call(summitVolumeAdapter, "initialize", [deployer]);
  return { summitVolumeAdapter };
});

const SummitOracleModule = buildModule("SummitOracle", (m) => {
  const { summitRouter } = m.useModule(SummitRouterModule);
  const summitOracle = m.contract("SummitOracle", [summitRouter, deployOptions.oracle.stable, deployOptions.wnative]);
  return { summitOracle };
});

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
      after: [spookySwapAdapter],
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

  // const { summitRouter } = m.useModule(SummitRouterModule);
  // const { summitPoints } = m.useModule(SummitPointsModule);
  // const { summitReferrals } = m.useModule(SummitReferralsModule);
  // const { summitVolumeAdapter } = m.useModule(SummitVolumeAdapterModule);
  // const { summitOracle } = m.useModule(SummitOracleModule);

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
