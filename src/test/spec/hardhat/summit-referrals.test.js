const { expect } = require("chai");
const { setTestEnv, addresses, helpers } = require("../../utils/test-env");
const { waffle } = require("hardhat");
const { loadFixture } = waffle;

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
    await expect(referrals.initialize(deployer.address)).to.be.revertedWith("AlreadyInitialized");
  });

  it("Set Points Contract", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await expect(referrals.setPointsContract(points.address))
      .to.emit(referrals, "UpdatedPointsContract")
      .withArgs(points.address);

    const pointsAdd = await referrals.SUMMIT_POINTS();
    expect(pointsAdd).to.eq(points.address);
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

  it("Global Boost", async () => {
    const { referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await expect(referrals.setGlobalBoost(100)).to.emit(referrals, "UpdatedGlobalBoost").withArgs(100);

    const boost = await referrals.GLOBAL_BOOST();
    expect(boost).to.eq(100);
  });

  it("Set Referrer Reversions", async () => {
    const { referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await referrals.boostReferrer(deployer.address, 4);
    await referrals.boostReferrer(user1.address, 4);
    await referrals.boostReferrer(user2.address, 4);

    // . Missing Referrer
    await expect(referrals.setReferrer(zeroAdd, "")).to.be.revertedWith("MissingReferral");

    // . Self Referral
    await expect(referrals.setReferrer(deployer.address, "")).to.be.revertedWith("SelfReferral");

    // . Already Referred by User
    await referrals.connect(user1).setReferrer(deployer.address, "");
    await expect(referrals.connect(user1).setReferrer(deployer.address, "")).to.be.revertedWith(
      "AlreadyReferredByUser"
    );

    // . Reciprocal Referral
    await expect(referrals.setReferrer(user1.address, "")).to.be.revertedWith("ReciprocalReferral");

    // . Tri Reciprocal Referral
    await referrals.connect(user2).setReferrer(user1.address, "");
    await expect(referrals.setReferrer(user2.address, "")).to.be.revertedWith("ReciprocalReferral");

    // . Referrer must be bronze
    await expect(referrals.setReferrer(user3.address, "")).to.be.revertedWith("MustBeAtLeastBronze");
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

    // . Revert if not bronze
    await expect(referrals.connect(deployer).setReferralCode("XXXX")).to.be.revertedWith("MustBeAtLeastBronze");
    await referrals.boostReferrer(deployer.address, 4);
    await expect(referrals.connect(deployer).setReferralCode("XXXX")).to.not.be.reverted;

    // . Revert if code not available
    await referrals.boostReferrer(user1.address, 4);
    await expect(referrals.connect(user1).setReferralCode("XXXX")).to.be.revertedWith("CodeNotAvailable");
    await expect(referrals.connect(user1).setReferralCode("XXXXX")).to.not.be.reverted;

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

    await referrals.connect(deployer).setReferralCode("YYYY");

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
    await expect(referrals.connect(user1).setReferrer(zeroAdd, "YYYY")).to.be.revertedWith("MissingReferral");

    // . Succeed if code match
    await expect(referrals.connect(user1).setReferrer(zeroAdd, "XXXX"))
      .to.emit(referrals, "UpdatedReferrer")
      .withArgs(user1.address, deployer.address);
  });

  it("Set Level Data", async () => {
    const { referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    // . Length Mismatch
    await expect(referrals.setLevelData([0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], 0)).to.be.revertedWith(
      "LengthMismatch"
    );
    await expect(referrals.setLevelData([0, 0, 0, 0], [0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], 0)).to.be.revertedWith(
      "LengthMismatch"
    );
    await expect(referrals.setLevelData([0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0], [0, 0, 0, 0], 0)).to.be.revertedWith(
      "LengthMismatch"
    );
    await expect(referrals.setLevelData([0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0], 0)).to.be.revertedWith(
      "LengthMismatch"
    );

    // . Event emitted
    // . Level Count Updated
    // . Bonus For Being Referred Updated
    // . REQs and REWs updated
    await expect(referrals.setLevelData([0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], 1))
      .to.emit(referrals, "UpdatedLevelData")
      .withArgs([0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], 1);

    const levelCount = await referrals.levelCount();
    expect(levelCount).to.eq(4);

    const bonusForBeingReferred = await referrals.BONUS_FOR_BEING_REFERRED();
    expect(bonusForBeingReferred).to.eq(1);

    const level4RefPointsReq = await referrals.LEVEL_REF_POINTS_REQ(levelCount - 1);
    const level4SelfPointsReq = await referrals.LEVEL_SELF_POINTS_REQ(levelCount - 1);
    const level4RefsReq = await referrals.LEVEL_REFS_REQ(levelCount - 1);
    const level4MultRew = await referrals.LEVEL_MULT_REWARD(levelCount - 1);
    expect(level4RefPointsReq).to.eq(3);
    expect(level4SelfPointsReq).to.eq(3);
    expect(level4RefsReq).to.eq(3);
    expect(level4MultRew).to.eq(3);
  });
});
