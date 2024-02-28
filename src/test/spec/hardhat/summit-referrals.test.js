const { expect } = require("chai");
const { setTestEnv, addresses, helpers } = require("../../utils/test-env");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const e18 = (n) => {
  return ethers.parseUnits(`${n}`);
};

describe("SummitReferrals", function () {
  let testEnv;
  // let referrals;
  let zeroAdd = "0x0000000000000000000000000000000000000000";
  // let deployer;
  // let user1;
  // let user2;
  // let user3;
  // let user4;

  async function deployFixture() {
    const networkName = "blasttest";
    const forkBlockNumber = 2130364;
    testEnv = await setTestEnv(networkName, forkBlockNumber);

    // deployer = testEnv.deployer;
    // user1 = testEnv.user1;
    // user2 = testEnv.user2;
    // user3 = testEnv.user3;
    // user4 = testEnv.user4;

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
    const { referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await referrals.initialize(deployer.address);

    // Already initialized should revert
    await expect(referrals.initialize(deployer.address)).to.be.revertedWithCustomError(referrals, "AlreadyInitialized");
  });

  it("Set Points Contract", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await expect(referrals.setPointsContract(points.target))
      .to.emit(referrals, "UpdatedPointsContract")
      .withArgs(points.target);

    const pointsAdd = await referrals.SUMMIT_POINTS();
    expect(pointsAdd).to.eq(points.target);
  });

  it("Boost Referrer", async () => {
    const { referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    const levelInit = await referrals.getReferrerLevel(deployer.address);
    expect(levelInit).to.eq(0);

    await expect(referrals.boostReferrer(deployer.address, 4))
      .to.emit(referrals, "BoostedReferrer")
      .withArgs(deployer.address, 4);

    const levelFinal = await referrals.getReferrerLevel(deployer.address);
    expect(levelFinal).to.eq(4);

    // Ensure no overboost (eg boost to level 10 when only 4 levels exist)
    await referrals.boostReferrer(deployer.address, 10);
    const overboostLevel = await referrals.getReferrerLevel(deployer.address);
    expect(overboostLevel).to.eq(5);
  });

  it("Set Referrer Reversions", async () => {
    const { referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await referrals.boostReferrer(deployer.address, 4);
    await referrals.boostReferrer(user1.address, 4);
    await referrals.boostReferrer(user2.address, 4);

    // . Missing Referrer
    await expect(referrals.setReferrer(zeroAdd, "")).to.be.revertedWithCustomError(referrals, "MissingReferral");

    // . Self Referral
    await expect(referrals.setReferrer(deployer.address, "")).to.be.revertedWithCustomError(referrals, "SelfReferral");

    // . Already Referred by User
    await referrals.connect(user1).setReferrer(deployer.address, "");
    await expect(referrals.connect(user1).setReferrer(deployer.address, "")).to.be.revertedWithCustomError(
      referrals,
      "AlreadyReferredByUser"
    );

    // . Reciprocal Referral
    await expect(referrals.setReferrer(user1.address, "")).to.be.revertedWithCustomError(
      referrals,
      "ReciprocalReferral"
    );

    // . Tri Reciprocal Referral
    await referrals.connect(user2).setReferrer(user1.address, "");
    await expect(referrals.setReferrer(user2.address, "")).to.be.revertedWithCustomError(
      referrals,
      "ReciprocalReferral"
    );

    // . Referrer must be bronze
    await expect(referrals.setReferrer(user3.address, "")).to.be.revertedWithCustomError(
      referrals,
      "MustBeAtLeastBronze"
    );
  });

  it("Set Referrer Successes", async () => {
    const { referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await referrals.boostReferrer(deployer.address, 4);

    // . Should emit UpdatedReferrer Event
    await expect(referrals.connect(user1).setReferrer(deployer.address, ""))
      .to.emit(referrals, "UpdatedReferrer")
      .withArgs(user1.address, deployer.address);

    // . Ref count should increase
    const deployerRefsCountInit = await referrals.getRefsCount(deployer.address);
    await referrals.connect(user2).setReferrer(deployer.address, "");
    const deployerRefsCountFinal = await referrals.getRefsCount(deployer.address);
    expect(deployerRefsCountFinal - deployerRefsCountInit).to.eq(1);

    // . Referrer should be set
    const user3ReferrerInit = await referrals.getReferrer(user3.address);
    expect(user3ReferrerInit).to.eq(zeroAdd);
    await referrals.connect(user3).setReferrer(deployer.address, "");
    const user3ReferrerFinal = await referrals.getReferrer(user3.address);
    expect(user3ReferrerFinal).to.eq(deployer.address);
  });

  it("Switch Referrer Successes", async () => {
    const { referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await referrals.boostReferrer(deployer.address, 4);
    await referrals.boostReferrer(user1.address, 4);
    await referrals.connect(user2).setReferrer(deployer.address, "");

    // . New referrer ref count up, old referrer ref count down
    const deployerRefsCountInit = await referrals.getRefsCount(deployer.address);
    expect(deployerRefsCountInit).to.eq(1);
    const user1RefsCountInit = await referrals.getRefsCount(user1.address);
    expect(user1RefsCountInit).to.eq(0);

    await referrals.connect(user2).setReferrer(user1.address, "");

    const deployerRefsCountFinal = await referrals.getRefsCount(deployer.address);
    expect(deployerRefsCountFinal).to.eq(0);
    const user1RefsCountFinal = await referrals.getRefsCount(user1.address);
    expect(user1RefsCountFinal).to.eq(1);

    // . Referrer should be updated
    const user2ReferrerInit = await referrals.getReferrer(user2.address);
    expect(user2ReferrerInit).to.eq(user1.address);
    await referrals.connect(user2).setReferrer(deployer.address, "");
    const user2ReferrerFinal = await referrals.getReferrer(user2.address);
    expect(user2ReferrerFinal).to.eq(deployer.address);
  });

  it("Referral Code", async () => {
    const { referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    // . Revert if too short
    await expect(referrals.connect(deployer).setReferralCode("XX")).to.be.revertedWithCustomError(
      referrals,
      "InvalidCode"
    );

    // . Revert if too long
    await expect(referrals.connect(deployer).setReferralCode("XXXXXXXXXXXXXXXX")).to.be.revertedWithCustomError(
      referrals,
      "InvalidCode"
    );

    // . Revert if not bronze
    await expect(referrals.connect(deployer).setReferralCode("XXXX")).to.be.revertedWithCustomError(
      referrals,
      "MustBeAtLeastBronze"
    );
    await referrals.boostReferrer(deployer.address, 4);

    // . Succeed
    await expect(referrals.connect(deployer).setReferralCode("XXXX")).to.not.be.reverted;

    // . Revert if user already set code
    await expect(referrals.connect(deployer).setReferralCode("YYYY")).to.be.revertedWithCustomError(
      referrals,
      "AlreadySetCode"
    );

    // . Revert for other user if code not available
    await referrals.boostReferrer(user1.address, 4);
    await expect(referrals.connect(user1).setReferralCode("XXXX")).to.be.revertedWithCustomError(
      referrals,
      "CodeNotAvailable"
    );

    // . Ref code should be set
    // . Ref code inv should be set
    // . Prev code should be cleared
    // . Prev code should become available
    const xxxxReferrerInit = await referrals.REF_CODE("XXXX");
    expect(xxxxReferrerInit).to.eq(deployer.address);

    const yyyyReferrerInit = await referrals.REF_CODE("YYYY");
    expect(yyyyReferrerInit).to.eq(zeroAdd);

    const deployerCodeInit = await referrals.REF_CODE_INV(deployer.address);
    expect(deployerCodeInit).to.eq("XXXX");

    await referrals.connect(deployer).maintainerSetReferralCode(deployer.address, "YYYY");

    const xxxxReferrerFinal = await referrals.REF_CODE("XXXX");
    expect(xxxxReferrerFinal).to.eq(zeroAdd);

    const yyyyReferrerFinal = await referrals.REF_CODE("YYYY");
    expect(yyyyReferrerFinal).to.eq(deployer.address);

    const deployerCodeFinal = await referrals.REF_CODE_INV(deployer.address);
    expect(deployerCodeFinal).to.eq("YYYY");
  });

  it("Set Referrer via Code", async () => {
    const { referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await referrals.boostReferrer(deployer.address, 4);
    await referrals.connect(deployer).setReferralCode("XXXX");

    // . Revert if no code match
    await expect(referrals.connect(user1).setReferrer(zeroAdd, "YYYY")).to.be.revertedWithCustomError(
      referrals,
      "MissingReferral"
    );

    // . Succeed if code match
    await expect(referrals.connect(user1).setReferrer(zeroAdd, "XXXX"))
      .to.emit(referrals, "UpdatedReferrer")
      .withArgs(user1.address, deployer.address);
  });

  it("Set Level Data", async () => {
    const { referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    // . Length Mismatch
    await expect(
      referrals.setLevelData([0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], 0)
    ).to.be.revertedWithCustomError(referrals, "LengthMismatch");
    await expect(
      referrals.setLevelData([0, 0, 0, 0], [0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], 0)
    ).to.be.revertedWithCustomError(referrals, "LengthMismatch");
    await expect(
      referrals.setLevelData([0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0], [0, 0, 0, 0], 0)
    ).to.be.revertedWithCustomError(referrals, "LengthMismatch");
    await expect(
      referrals.setLevelData([0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0], 0)
    ).to.be.revertedWithCustomError(referrals, "LengthMismatch");

    // . Event emitted
    // . Level Count Updated
    // . Bonus For Being Referred Updated
    // . REQs and REWs updated
    await expect(referrals.setLevelData([0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], 1))
      .to.emit(referrals, "UpdatedLevelData")
      .withArgs([0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], 1);

    const levelCount = parseInt(await referrals.levelCount());
    expect(levelCount).to.eq(4);

    const bonusForBeingReferred = await referrals.BONUS_FOR_BEING_REFERRED();
    expect(bonusForBeingReferred).to.eq(1);

    const level4RefVolumeReq = await referrals.LEVEL_REF_VOLUME_REQ(levelCount - 1);
    const level4SelfVolumeReq = await referrals.LEVEL_SELF_VOLUME_REQ(levelCount - 1);
    const level4RefsReq = await referrals.LEVEL_REFS_REQ(levelCount - 1);
    const level4MultRew = await referrals.LEVEL_MULT_REWARD(levelCount - 1);
    expect(level4RefVolumeReq).to.eq(3);
    expect(level4SelfVolumeReq).to.eq(3);
    expect(level4RefsReq).to.eq(3);
    expect(level4MultRew).to.eq(3);
  });

  it("Level Requirements", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    // . REVERT: Invalid Level
    await expect(referrals.getLevelRequirements(10)).to.be.revertedWithCustomError(referrals, "InvalidLevel");

    const level4SelfVolReq = await referrals.LEVEL_SELF_VOLUME_REQ(4);
    const level4RefVolReq = await referrals.LEVEL_REF_VOLUME_REQ(4);
    const level4RefsReq = await referrals.LEVEL_REFS_REQ(4);

    const level4Reqs = await referrals.getLevelRequirements(4);
    expect(level4Reqs[0]).to.eq(level4SelfVolReq);
    expect(level4Reqs[1]).to.eq(level4RefVolReq);
    expect(level4Reqs[2]).to.eq(level4RefsReq);
  });

  it("Get Ref Volume Multiplier", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await referrals.boostReferrer(user1.address, 0);
    const volMult0 = parseInt(await referrals.getRefVolumeBonusMultiplier(user1.address));
    expect(volMult0).to.eq(0);

    await referrals.boostReferrer(user1.address, 4);
    const expectedVolMult4 = parseInt(await referrals.LEVEL_MULT_REWARD(4));
    const volMult4 = parseInt(await referrals.getRefVolumeBonusMultiplier(user1.address));
    expect(volMult4).to.eq(expectedVolMult4);
  });

  it("Get Self Volume Multiplier", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await referrals.boostReferrer(user2.address, 4);

    const volMultNoRef = parseInt(await referrals.getSelfVolumeMultiplier(user1.address));
    expect(volMultNoRef).to.eq(10000);

    await referrals.connect(user1).setReferrer(user2.address, "");

    const bonusForBeingReferred = parseInt(await referrals.BONUS_FOR_BEING_REFERRED());
    const volMultWithRef = parseInt(await referrals.getSelfVolumeMultiplier(user1.address));
    expect(volMultWithRef).to.eq(10000 + bonusForBeingReferred);
  });

  it("Referrer Level", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setVolumeAdapter(deployer.address);
    await points.setReferralsContract(referrals.target);
    await referrals.setPointsContract(points.target);

    // . SUCCEED: Wood --> Bronze
    await expect(referrals.connect(user2).setReferrer(user1.address, "")).to.be.revertedWithCustomError(
      referrals,
      "MustBeAtLeastBronze"
    );

    await points.addVolume(user1.address, e18(100));

    const user1Level1 = parseInt(await referrals.getReferrerLevel(user1.address));
    expect(user1Level1).to.eq(1);

    await expect(referrals.connect(user2).setReferrer(user1.address, "")).to.not.be.reverted;

    // . SUCCEED: Bronze --> Silver (ALL 3 REQUIREMENTS MUST BE MET)

    // ... Test Self Vol Req
    await points.addVolume(user1.address, e18(900));
    const user1Level2TestA = parseInt(await referrals.getReferrerLevel(user1.address));
    expect(user1Level2TestA).to.eq(1);
    // ... Test Req Vol Req
    await points.addVolume(user2.address, e18(10000));
    const user1Level2TestB = parseInt(await referrals.getReferrerLevel(user1.address));
    expect(user1Level2TestB).to.eq(1);
    // ... Test Refs Req
    await referrals.connect(user3).setReferrer(user1.address, "");
    await referrals.connect(user4).setReferrer(user1.address, "");

    const user1Level2Test2 = parseInt(await referrals.getReferrerLevel(user1.address));
    expect(user1Level2Test2).to.eq(2);

    const user1Level2 = parseInt(await referrals.getReferrerLevel(user1.address));
    expect(user1Level2).to.eq(2);
  });
});
