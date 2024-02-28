const { expect } = require("chai");
const { setTestEnv, addresses, helpers } = require("../../utils/test-env");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const e18 = (n) => {
  return ethers.parseUnits(`${n}`);
};

describe("SummitPoints", function () {
  let zeroAdd = "0x0000000000000000000000000000000000000000";

  async function deployFixture() {
    const networkName = "blasttest";
    const forkBlockNumber = 2130364;
    const testEnv = await setTestEnv(networkName, forkBlockNumber);

    const referralsContractName = "SummitReferrals";
    const referralsArgs = [{ gasLimit: 4000000 }];

    const referrals = await helpers.deployContract(referralsContractName, {
      deployer: testEnv.deployer,
      args: referralsArgs,
    });

    const pointsContractName = "SummitPoints";
    const pointsArgs = [{ gasLimit: 4000000 }];

    const points = await helpers.deployContract(pointsContractName, {
      deployer: testEnv.deployer,
      args: pointsArgs,
    });

    return {
      referrals,
      points,
      deployer: testEnv.deployer,
      user1: testEnv.user1,
      user2: testEnv.user2,
      user3: testEnv.user3,
      user4: testEnv.user4,
    };
  }

  it("Initialize", async () => {
    const { points, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await points.initialize(deployer.address);

    // Already initialized should revert
    await expect(points.initialize(deployer.address)).to.be.revertedWithCustomError(points, "AlreadyInitialized");
  });

  it("Only Maintainer", async () => {
    const { points, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await expect(points.connect(user1).setGlobalBoost(100)).to.be.revertedWith(
      "Maintainable: Caller is not a maintainer"
    );
  });

  it("Set Points Adapter", async () => {
    const { points, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await expect(points.setVolumeAdapter(deployer.address))
      .to.emit(points, "UpdatedVolumeAdapter")
      .withArgs(deployer.address);

    const pointsAdapterAdd = await points.VOLUME_ADAPTER();
    expect(pointsAdapterAdd).to.eq(deployer.address);
  });

  it("Set Referrals Contract", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await expect(points.setReferralsContract(referrals.target))
      .to.emit(points, "UpdatedReferralsContract")
      .withArgs(referrals.target);

    const referralsAdd = await points.REFERRALS();
    expect(referralsAdd).to.eq(referrals.target);
  });

  it("Set Volume Scalers", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await expect(points.setVolumeScalers(1000, 1000)).to.emit(points, "UpdatedVolumeScalers").withArgs(1000, 1000);

    const newRefScaler = await points.REF_VOLUME_SCALER();
    const newAdapterScaler = await points.ADAPTER_VOLUME_SCALER();
    expect(newRefScaler).to.eq(1000);
    expect(newAdapterScaler).to.eq(1000);
  });

  it("Set Blacklisted", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setVolumeAdapter(deployer.address);

    const blacklistedInit = await points.BLACKLISTED(user1.address);
    expect(blacklistedInit).to.eq(false);

    // Points should be non 0
    await points.addVolume(user1.address, 10000); // SELF
    const pointsInit = await points.getPoints(user1.address);
    expect(pointsInit[3]).to.eq(100);

    await expect(points.setBlacklisted(user1.address, true))
      .to.emit(points, "UpdatedBlacklisted")
      .withArgs(user1.address, true);

    // Points should be 0
    const pointsFinal = await points.getPoints(user1.address);
    expect(pointsFinal[3]).to.eq(0);

    // Blacklisted state should update
    const blackListedFinal = await points.BLACKLISTED(user1.address);
    expect(blackListedFinal).to.eq(true);
  });

  it("Delegate", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    // . REVERT: Not Permitted
    await expect(points.connect(user1).setDelegate(user2.address, user1.address)).to.be.revertedWithCustomError(
      points,
      "NotPermitted"
    );

    // . SUCCEED: Set own delegate
    await expect(points.connect(user1).setDelegate(user1.address, user2.address))
      .to.emit(points, "UpdatedDelegate")
      .withArgs(user1.address, user1.address, user2.address);

    // . SUCCEED: Delegate can update delegate
    await expect(points.connect(user2).setDelegate(user1.address, user3.address))
      .to.emit(points, "UpdatedDelegate")
      .withArgs(user2.address, user1.address, user3.address);

    // . SUCCEED: User can still remove delegate
    await expect(points.connect(user1).setDelegate(user1.address, zeroAdd))
      .to.emit(points, "UpdatedDelegate")
      .withArgs(user1.address, user1.address, zeroAdd);

    // . SUCCEED: Maintainer can set delegate for contract
    await expect(points.setAdapterDelegate(user1.address, user2.address))
      .to.emit(points, "UpdatedAdapterDelegate")
      .withArgs(user1.address, user2.address);
  });

  it("Add Adapter Volume (NO BOOST)", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setVolumeAdapter(deployer.address);

    // . REVERT: Not Permitted
    await expect(points.connect(user1).addAdapterVolume(user1.address, 100)).to.be.revertedWithCustomError(
      points,
      "NotPermitted"
    );

    // . SUCCEED: Adds to adapter volume
    await expect(points.addAdapterVolume(user1.address, 100))
      .to.emit(points, "AddedAdapterVolume")
      .withArgs(user1.address, 100);

    const adapterVolume = await points.ADAPTER_VOLUME(user1.address);
    expect(adapterVolume).to.eq(100);
  });

  it("Add Adapter Volume (WITH BOOST)", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setVolumeAdapter(deployer.address);

    // Setup Global Boost
    await points.setGlobalBoost(500);
    const globalBoost = parseInt(await points.GLOBAL_BOOST());

    // Add Points
    const volumeToAdd = 1000000;
    const expectedVolumeWithBoost = (volumeToAdd * (10000 + globalBoost)) / 10000;

    // . SUCCEED: Adds to adapter volume
    await expect(points.addAdapterVolume(user1.address, volumeToAdd))
      .to.emit(points, "AddedAdapterVolume")
      .withArgs(user1.address, expectedVolumeWithBoost);

    const adapterVolume = await points.ADAPTER_VOLUME(user1.address);
    expect(adapterVolume).to.eq(expectedVolumeWithBoost);
  });

  it("Add Volume (NO REFERRALS)", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setVolumeAdapter(deployer.address);

    // . REVERT: Not Permitted
    await expect(points.connect(user1).addVolume(user1.address, 100)).to.be.revertedWithCustomError(
      points,
      "NotPermitted"
    );

    // . SUCCEED: Adds to self points
    await expect(points.addVolume(user1.address, 100)).to.emit(points, "AddedUserVolume").withArgs(user1.address, 100);
    const user1Volume = await points.SELF_VOLUME(user1.address);
    expect(user1Volume).to.eq(100);
  });

  it("Add Volume (NO REFERRALS, WITH GLOBAL_BOOST)", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setReferralsContract(referrals.target);
    await points.setVolumeAdapter(deployer.address);

    // Setup Global Boost
    await points.setGlobalBoost(500);
    const globalBoost = parseInt(await points.GLOBAL_BOOST());

    // Add Points
    const volumeToAdd = 1000000;
    const expectedVolumeWithBoost = (volumeToAdd * (10000 + globalBoost)) / 10000;

    // . SUCCEED: Add points with referral
    await expect(points.addVolume(user1.address, volumeToAdd))
      .to.emit(points, "AddedUserVolume")
      .withArgs(user1.address, expectedVolumeWithBoost);

    const user1Volume = await points.getVolume(user1.address);

    expect(user1Volume[0]).to.eq(expectedVolumeWithBoost);
  });

  it("Add Volume (WITH REFERRALS, NO GLOBAL_BOOST)", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setReferralsContract(referrals.target);
    await points.setVolumeAdapter(deployer.address);

    // Setup Referrals
    await referrals.boostReferrer(user2.address, 4);
    await referrals.connect(user1).setReferrer(user2.address, "");

    // Add Points
    const pointsToAdd = 1000000;

    // . SUCCEED: Add volume with referral, emit AddedReferrerVolume
    await expect(points.addVolume(user1.address, pointsToAdd))
      .to.emit(points, "AddedReferrerVolume")
      .withArgs(user2.address, user1.address, pointsToAdd);

    const user1SelfVolume = await points.SELF_VOLUME(user1.address);
    const user2RefVolume = await points.REF_VOLUME(user2.address);

    expect(user1SelfVolume).to.eq(pointsToAdd);
    expect(user2RefVolume).to.eq(pointsToAdd);
  });

  it("Add Points (WITH REFERRALS, WITH GLOBAL_BOOST)", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setReferralsContract(referrals.target);
    await points.setVolumeAdapter(deployer.address);

    // Setup Global Boost
    await points.setGlobalBoost(500);
    const globalBoost = parseInt(await points.GLOBAL_BOOST());

    // Setup Referrals
    await referrals.boostReferrer(user2.address, 4);
    await referrals.connect(user1).setReferrer(user2.address, "");

    // Add Points
    const volumeToAdd = 1000000;
    const expectedVolumeWithBoost = (volumeToAdd * (10000 + globalBoost)) / 10000;

    // . SUCCEED: Add points with referral
    await expect(points.addVolume(user1.address, volumeToAdd))
      .to.emit(points, "AddedReferrerVolume")
      .withArgs(user2.address, user1.address, expectedVolumeWithBoost);

    const user1SelfVolume = await points.SELF_VOLUME(user1.address);
    const user2RefVolume = await points.REF_VOLUME(user2.address);

    expect(user1SelfVolume).to.eq(expectedVolumeWithBoost);
    expect(user2RefVolume).to.eq(expectedVolumeWithBoost);
  });

  it("Transfer Volume", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setVolumeAdapter(deployer.address);
    await points.setReferralsContract(referrals.target);
    await referrals.setPointsContract(points.target);

    // Setup Referrals
    await referrals.boostReferrer(user1.address, 4);
    await referrals.connect(user2).setReferrer(user1.address, "");

    // Add Points
    await points.addVolume(user1.address, 100); // SELF
    await points.addVolume(user2.address, 100); // REF
    await points.addAdapterVolume(user1.address, 100); // ADAPTER

    // . REVERT: Zero Address
    await expect(points.connect(user1).transferVolume(user1.address, zeroAdd, 100, 0, 0)).to.be.revertedWithCustomError(
      points,
      "ZeroAddress"
    );

    // . REVERT: Not Permitted
    await expect(
      points.connect(user2).transferVolume(user1.address, user2.address, 100, 100, 100)
    ).to.be.revertedWithCustomError(points, "NotPermitted");

    // . REVERT: Invalid Self Amount
    await expect(
      points.connect(user1).transferVolume(user1.address, user2.address, 200, 0, 0)
    ).to.be.revertedWithCustomError(points, "InvalidSelfAmount");

    // . REVERT: Invalid Ref Amount
    await expect(
      points.connect(user1).transferVolume(user1.address, user2.address, 0, 200, 0)
    ).to.be.revertedWithCustomError(points, "InvalidRefAmount");

    // . REVERT: Invalid Adapter Amount
    await expect(
      points.connect(user1).transferVolume(user1.address, user2.address, 0, 0, 200)
    ).to.be.revertedWithCustomError(points, "InvalidAdapterAmount");

    // . SUCCEED: User can transfer own points
    await expect(points.connect(user1).transferVolume(user1.address, user3.address, 50, 50, 50))
      .to.emit(points, "TransferredVolume")
      .withArgs(user1.address, user1.address, user3.address, 50, 50, 50);
    const user1Volume = await points.getVolume(user1.address);
    const user3Volume = await points.getVolume(user3.address);

    // Self
    expect(user1Volume[0]).to.eq(50);
    expect(user3Volume[0]).to.eq(50);
    // Ref
    expect(user1Volume[1]).to.eq(50);
    expect(user3Volume[1]).to.eq(50);
    // Adapter
    expect(user1Volume[2]).to.eq(50);
    expect(user3Volume[2]).to.eq(50);

    // . SUCCEED: Delegate can transfer points
    await points.connect(user1).setDelegate(user1.address, user3.address);
    await expect(points.connect(user3).transferVolume(user1.address, user3.address, 50, 50, 50))
      .to.emit(points, "TransferredVolume")
      .withArgs(user3.address, user1.address, user3.address, 50, 50, 50);
    const user1Volume2 = await points.getVolume(user1.address);
    const user3Volume2 = await points.getVolume(user3.address);

    // Self
    expect(user1Volume2[0]).to.eq(0);
    expect(user3Volume2[0]).to.eq(100);
    // Ref
    expect(user1Volume2[1]).to.eq(0);
    expect(user3Volume2[1]).to.eq(100);
    // Adapter
    expect(user1Volume2[2]).to.eq(0);
    expect(user3Volume2[2]).to.eq(100);
  });

  it("Get Points", async function () {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setVolumeAdapter(deployer.address);
    await points.setReferralsContract(referrals.target);
    await referrals.setPointsContract(points.target);

    // Setup Referrals
    await referrals.boostReferrer(user1.address, 4);
    await referrals.connect(user2).setReferrer(user1.address, "");

    // Add Points
    await points.addVolume(user1.address, e18(100)); // SELF
    await points.addVolume(user2.address, e18(100)); // REF
    await points.addAdapterVolume(user1.address, e18(100)); // ADAPTER

    const userSelfVolMult = parseInt(await referrals.getSelfVolumeMultiplier(user1.address));
    const userRefVolMult = parseInt(await referrals.getRefVolumeBonusMultiplier(user1.address));
    const baseVolScaler = parseInt(await points.BASE_VOLUME_SCALER());
    const pointsRefVolScaler = parseInt(await points.REF_VOLUME_SCALER());
    const pointsAdapterVolScaler = parseInt(await points.ADAPTER_VOLUME_SCALER());

    const expectedPointsFromSelfVol = (100 * userSelfVolMult * baseVolScaler) / (10000 * 10000);
    const expectedPointsFromRefVol = (100 * (userRefVolMult + pointsRefVolScaler) * baseVolScaler) / (10000 * 10000);
    const expectedPointsFromAdapterVol = (100 * pointsAdapterVolScaler * baseVolScaler) / (10000 * 10000);
    const expectedPointsTotal = expectedPointsFromSelfVol + expectedPointsFromRefVol + expectedPointsFromAdapterVol;

    const [pointsFromSelf, pointsFromRef, pointsFromAdapter, pointsTotal] = await points.getPoints(user1.address);

    expect(pointsFromSelf).to.be.closeTo(e18(expectedPointsFromSelfVol), 10000);
    expect(pointsFromRef).to.be.closeTo(e18(expectedPointsFromRefVol), 10000);
    expect(pointsFromAdapter).to.be.closeTo(e18(expectedPointsFromAdapterVol), 10000);
    expect(pointsTotal).to.be.closeTo(e18(expectedPointsTotal), 10000);

    // const userVolume = await points.getVolume(user1.address);

    // console.log({
    //   summitPoints,
    //   userSelfVolMult,
    //   userRefVolMult,
    //   pointsRefVolScaler,
    //   pointsAdapterVolScaler,
    //   expectedPointsFromSelfVol,
    //   expectedPointsFromRefVol,
    //   expectedPointsFromAdapterVol,
    //   expectedPointsTotal,
    //   userSelfVol: parseInt(userVolume[0]),
    //   userRefVol: parseInt(userVolume[1]),
    //   userAdapterVol: parseInt(userVolume[2]),
    // });
  });
});
