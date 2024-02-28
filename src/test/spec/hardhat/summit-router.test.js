const { expect } = require("chai");
const { setTestEnv, addresses, helpers } = require("../../utils/test-env");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const e18 = (n) => {
  return eN(n, 18);
};
const eN = (n, e) => {
  return ethers.parseUnits(`${n}`, e);
};

// describe("SummitRouter", function () {
//   let zeroAdd = "0x0000000000000000000000000000000000000000";

//   async function deployFixture() {
//     const networkName = "blasttest";
//     const forkBlockNumber = 2130364;
//     const testEnv = await setTestEnv(networkName, forkBlockNumber);

//     const deployer = testEnv.deployer;

//     const TOKEN_A = await helpers.deployContract("TestToken", {
//       deployer,
//       args: ["TOKEN_A", "TOKEN_A", { gas: 4000000 }],
//     });
//     const TOKEN_B = await helpers.deployContract("TestToken", {
//       deployer,
//       args: ["TOKEN_B", "TOKEN_B"],
//     });

//     const dummyAdapter = await helpers.deployContract("DummyAdapter", {
//       deployer,
//       args: ["DummyAdapter", 0, TOKEN_A.target, TOKEN_B.target, { gas: 4000000 }],
//     });

//     // Mint tokens
//     await TOKEN_A.mint(dummyAdapter.target, e18(100));
//     await TOKEN_A.mint(deployer.address, e18(100));
//     await TOKEN_B.mint(dummyAdapter.target, e18(5000));
//     await TOKEN_B.mint(deployer.address, e18(5000));

//     const summitRouter = await helpers.deployContract("SummitRouter", {
//       deployer,
//       args: [[dummyAdapter.target], [TOKEN_A.target, TOKEN_B.target], testEnv.user4.address, TOKEN_A.target],
//     });

//     const multifier = (price, decOffset) => {
//       return eN(price, 12 + decOffset);
//     };

//     const tokenAMult = multifier(50.5, 0);
//     console.log({
//       tokenAMult,
//       usdcMult: multifier(1, 12),
//     });

//     await summitRouter.setTokenVolumeMultipliers([TOKEN_A.target, TOKEN_B.target], [multifier(50, 0), multifier(1, 0)]);
//     await TOKEN_A.approve(summitRouter.target, e18(100));
//     await TOKEN_B.approve(summitRouter.target, e18(100));

//     const summitPoints = await helpers.deployContract("SummitPoints", { deployer, args: [] });
//     await summitPoints.initialize(deployer);

//     const summitReferrals = await helpers.deployContract("SummitReferrals", { deployer, args: [] });
//     await summitReferrals.initialize(deployer);

//     const summitVolumeAdapter = await helpers.deployContract("SummitVolumeAdapterV1", { deployer, args: [] });
//     await summitVolumeAdapter.initialize(deployer);

//     // Points Contract
//     await summitPoints.setVolumeAdapter(summitVolumeAdapter.target);
//     await summitPoints.setReferralsContract(summitReferrals.target);

//     // Referrals Contract
//     await summitReferrals.setPointsContract(summitPoints.target);

//     // Volume Adapter Contract
//     await summitVolumeAdapter.setRouter(summitRouter.target);
//     await summitVolumeAdapter.setPointsContract(summitPoints);

//     // Router Contract
//     await summitRouter.setVolumeAdapter(summitVolumeAdapter);

//     return {
//       TOKEN_A,
//       TOKEN_B,
//       dummyAdapter,
//       router: summitRouter,
//       points: summitPoints,
//       referrals: summitReferrals,
//       deployer: testEnv.deployer,
//       user1: testEnv.user1,
//       user2: testEnv.user2,
//       user3: testEnv.user3,
//       FEE_CLAIMER: testEnv.user4,
//     };
//   }

//   it("Deploys", async () => {
//     await loadFixture(deployFixture);
//   });
//   it("Can do a swap", async () => {
//     const { router, points, dummyAdapter, deployer, TOKEN_A, TOKEN_B, FEE_CLAIMER } = await loadFixture(deployFixture);

//     const tokenABalInit = await TOKEN_A.balanceOf(deployer.address);
//     const tokenBBalInit = await TOKEN_B.balanceOf(deployer.address);

//     await expect(
//       router.swapNoSplit(
//         {
//           amountIn: e18(1),
//           amountOut: 0,
//           path: [TOKEN_A.target, TOKEN_B.target],
//           adapters: [dummyAdapter.target],
//         },
//         deployer.address,
//         10
//       )
//     ).to.not.be.reverted;

//     const tokenABalFinal = await TOKEN_A.balanceOf(deployer.address);
//     const tokenBBalFinal = await TOKEN_B.balanceOf(deployer.address);

//     console.log({
//       tokenADiff: tokenABalFinal - tokenABalInit,
//       tokenBDiff: tokenBBalFinal - tokenBBalInit,
//     });

//     const userVolume = await points.getVolume(deployer.address);
//     const adapterVolume = await points.getVolume(dummyAdapter.target);

//     console.log({
//       userVolume,
//       adapterVolume,
//     });
//   });
// });
