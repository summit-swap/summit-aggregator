const { expect } = require("chai");
const { setTestEnv, addresses, helpers } = require("../../utils/test-env");
const { ethers } = require("hardhat");
const { loadFixture } = waffle;

const e18 = (n) => {
  return ethers.utils.parseUnits(`${n}`);
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
    await expect(points.initialize(deployer.address)).to.be.revertedWith("AlreadyInitialized");
  });

  it("Set Points Adapter", async () => {
    const { points, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await expect(points.setPointsAdapter(deployer.address))
      .to.emit(points, "UpdatedPointsAdapter")
      .withArgs(deployer.address);

    const pointsAdapterAdd = await points.POINTS_ADAPTER();
    expect(pointsAdapterAdd).to.eq(deployer.address);
  });

  it("Set Referrals Contract", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    await expect(points.setReferralsContract(referrals.address))
      .to.emit(points, "UpdatedReferralsContract")
      .withArgs(referrals.address);

    const referralsAdd = await points.REFERRALS();
    expect(referralsAdd).to.eq(referrals.address);
  });

  it("Delegate", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);

    // . REVERT: Not Permitted
    await expect(points.connect(user1).setDelegate(user2.address, user1.address)).to.be.revertedWith("NotPermitted");

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
  it("Add Points (NO REFERRALS, NO GLOBAL_BOOST)", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setPointsAdapter(deployer.address);

    // . REVERT: Not Permitted
    await expect(points.connect(user1).addPoints(user1.address, 100)).to.be.revertedWith("NotPermitted");

    // . SUCCEED: Adds to self points
    await expect(points.addPoints(user1.address, 100))
      .to.emit(points, "AddedPoints")
      .withArgs(user1.address, zeroAdd, 100, 0);
    const user1Points = await points.SELF_POINTS(user1.address);
    expect(user1Points).to.eq(100);
  });
  it("Add Points (NO REFERRALS, WITH GLOBAL_BOOST)", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setReferralsContract(referrals.address);
    await points.setPointsAdapter(deployer.address);

    // Setup Global Boost
    await referrals.setGlobalBoost(500);
    const globalBoost = parseInt(await referrals.GLOBAL_BOOST());

    // Add Points
    const pointsToAdd = 1000000;
    const expectedUser1SelfPoints = (pointsToAdd * (10000 + globalBoost)) / 10000;

    // . SUCCEED: Add points with referral
    await expect(points.addPoints(user1.address, pointsToAdd))
      .to.emit(points, "AddedPoints")
      .withArgs(user1.address, zeroAdd, expectedUser1SelfPoints, 0);

    const user1Points = await points.getPoints(user1.address);

    expect(user1Points[0]).to.eq(expectedUser1SelfPoints);
  });
  it("Add Points (WITH REFERRALS, NO GLOBAL_BOOST)", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setReferralsContract(referrals.address);
    await points.setPointsAdapter(deployer.address);

    // Setup Referrals
    await referrals.boostReferrer(user2.address, 4);
    await referrals.connect(user1).setReferrer(user2.address, "");

    // Add Points
    const pointsToAdd = 1000000;

    const bonusForBeingReferred = parseInt(await referrals.BONUS_FOR_BEING_REFERRED());
    const expectedUser1SelfPoints = (pointsToAdd * (10000 + bonusForBeingReferred)) / 10000;

    const user2ReferrerMult = parseInt(await referrals.getReferrerMultiplier(user2.address));
    const expectedUser2RefPoints = (pointsToAdd * user2ReferrerMult) / 10000;

    // . SUCCEED: Add points with referral
    await expect(points.addPoints(user1.address, pointsToAdd))
      .to.emit(points, "AddedPoints")
      .withArgs(user1.address, user2.address, expectedUser1SelfPoints, expectedUser2RefPoints);

    const user1Points = await points.getPoints(user1.address);
    const user2Points = await points.getPoints(user2.address);

    expect(user1Points[0]).to.eq(expectedUser1SelfPoints);
    expect(user2Points[1]).to.eq(expectedUser2RefPoints);
  });
  it("Add Points (WITH REFERRALS, WITH GLOBAL_BOOST)", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setReferralsContract(referrals.address);
    await points.setPointsAdapter(deployer.address);

    // Setup Global Boost
    await referrals.setGlobalBoost(500);
    const globalBoost = parseInt(await referrals.GLOBAL_BOOST());

    // Setup Referrals
    await referrals.boostReferrer(user2.address, 4);
    await referrals.connect(user1).setReferrer(user2.address, "");

    // Add Points
    const pointsToAdd = 1000000;

    const bonusForBeingReferred = parseInt(await referrals.BONUS_FOR_BEING_REFERRED());
    const expectedUser1SelfPoints =
      (pointsToAdd * (10000 + bonusForBeingReferred) * (10000 + globalBoost)) / (10000 * 10000);

    const user2ReferrerMult = parseInt(await referrals.getReferrerMultiplier(user2.address));
    const expectedUser2RefPoints = (pointsToAdd * user2ReferrerMult * (10000 + globalBoost)) / (10000 * 10000);

    // . SUCCEED: Add points with referral
    await expect(points.addPoints(user1.address, pointsToAdd))
      .to.emit(points, "AddedPoints")
      .withArgs(user1.address, user2.address, expectedUser1SelfPoints, expectedUser2RefPoints);

    const user1Points = await points.getPoints(user1.address);
    const user2Points = await points.getPoints(user2.address);

    expect(user1Points[0]).to.eq(expectedUser1SelfPoints);
    expect(user2Points[1]).to.eq(expectedUser2RefPoints);
  });
  it("Transfer Points", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setPointsAdapter(deployer.address);
    await points.addPoints(user1.address, 100);

    // . REVERT: Zero Address
    await expect(points.connect(user1).transferPoints(user1.address, zeroAdd, 100, 0)).to.be.revertedWith(
      "ZeroAddress"
    );

    // . REVERT: Not Permitted
    await expect(points.connect(user2).transferPoints(user1.address, user2.address, 100, 0)).to.be.revertedWith(
      "NotPermitted"
    );

    // . REVERT: Invalid Self Amount
    await expect(points.connect(user1).transferPoints(user1.address, user2.address, 200, 0)).to.be.revertedWith(
      "InvalidSelfAmount"
    );

    // . REVERT: Invalid Ref Amount
    await expect(points.connect(user1).transferPoints(user1.address, user2.address, 100, 100)).to.be.revertedWith(
      "InvalidRefAmount"
    );

    // . SUCCEED: User can transfer own points
    await expect(points.connect(user1).transferPoints(user1.address, user2.address, 50, 0))
      .to.emit(points, "TransferredPoints")
      .withArgs(user1.address, user1.address, user2.address, 50, 0);
    const [user1SelfPoints, user1RefPoints] = await points.getPoints(user1.address);
    const [user2SelfPoints, user2RefPoints] = await points.getPoints(user2.address);
    expect(user1SelfPoints).to.eq(50);
    expect(user2SelfPoints).to.eq(50);
    expect(user1RefPoints).to.eq(0);
    expect(user2RefPoints).to.eq(0);

    // . SUCCEED: Delegate can transfer points
    await points.connect(user1).setDelegate(user1.address, user2.address);
    await expect(points.connect(user2).transferPoints(user1.address, user2.address, 50, 0))
      .to.emit(points, "TransferredPoints")
      .withArgs(user2.address, user1.address, user2.address, 50, 0);
    const [user1SelfPoints2, user1RefPoints2] = await points.getPoints(user1.address);
    const [user2SelfPoints2, user2RefPoints2] = await points.getPoints(user2.address);
    expect(user1SelfPoints2).to.eq(0);
    expect(user2SelfPoints2).to.eq(100);
    expect(user1RefPoints2).to.eq(0);
    expect(user2RefPoints2).to.eq(0);
  });
  it("Transfer Points (DELEGATE)", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setPointsAdapter(deployer.address);
    await points.addPoints(user1.address, 100);

    // Setup Referrals
    await referrals.boostReferrer(user2.address, 4);
    await referrals.connect(user1).setReferrer(user2.address, "");

    // Add Points (both SELF and REF)
    const pointsToAdd = 1000000;
    await points.addPoints(user1.address, pointsToAdd);
    const user1SelfPoints = parseInt((await points.getPoints(user1.address))[0]);
    const user2RefPoints = parseInt((await points.getPoints(user2.address))[1]);

    // Setup Delegates
    await points.connect(user1).setDelegate(user1.address, user3.address);
    await points.connect(user2).setDelegate(user2.address, user3.address);

    // . SUCCEED: Delegate can transfer self points
    await expect(points.connect(user3).transferPoints(user1.address, user3.address, user1SelfPoints / 2, 0))
      .to.emit(points, "TransferredPoints")
      .withArgs(user3.address, user1.address, user3.address, user1SelfPoints / 2, 0);
    const user1SelfPointsFinal = parseInt((await points.getPoints(user1.address))[0]);
    const user3SelfPointsFinal = parseInt((await points.getPoints(user3.address))[0]);
    expect(user1SelfPointsFinal).to.eq(user1SelfPoints / 2);
    expect(user3SelfPointsFinal).to.eq(user1SelfPoints / 2);

    // . SUCCEED: Delegate can transfer ref points
    await expect(points.connect(user3).transferPoints(user2.address, user3.address, 0, user2RefPoints / 2))
      .to.emit(points, "TransferredPoints")
      .withArgs(user3.address, user2.address, user3.address, 0, user2RefPoints / 2);
    const user2RefPointsFinal = parseInt((await points.getPoints(user2.address))[1]);
    const user3RefPointsFinal = parseInt((await points.getPoints(user3.address))[1]);
    expect(user2RefPointsFinal).to.eq(user2RefPoints / 2);
    expect(user3RefPointsFinal).to.eq(user2RefPoints / 2);

    // . SUCCEED: Can transfer both self and ref points
    await expect(
      points.connect(user3).transferPoints(user3.address, user4.address, user1SelfPoints / 2, user2RefPoints / 2)
    )
      .to.emit(points, "TransferredPoints")
      .withArgs(user3.address, user3.address, user4.address, user1SelfPoints / 2, user2RefPoints / 2);
    const user3FinalPoints = await points.getPoints(user3.address);
    const user4FinalPoints = await points.getPoints(user4.address);

    expect(user3FinalPoints[0]).to.eq(0);
    expect(user3FinalPoints[1]).to.eq(0);
    expect(user4FinalPoints[0]).to.eq(user1SelfPoints / 2);
    expect(user4FinalPoints[1]).to.eq(user2RefPoints / 2);
  });
  it.only("Referrer Level", async () => {
    const { points, referrals, deployer, user1, user2, user3, user4 } = await loadFixture(deployFixture);
    await points.setPointsAdapter(deployer.address);
    await points.setReferralsContract(referrals.address);
    await referrals.setPointsContract(points.address);

    const user1Level0 = parseInt(await referrals.getReferrerLevel(user1.address));

    // . SUCCEED: Wood --> Bronze
    await expect(referrals.connect(user2).setReferrer(user1.address, "")).to.be.revertedWith("MustBeAtLeastBronze");

    await points.addPoints(user1.address, e18(100));

    const user1Level1 = parseInt(await referrals.getReferrerLevel(user1.address));
    expect(user1Level1).to.eq(1);
    const user1Level1Mult = parseInt(await referrals.getReferrerMultiplier(user1.address));
    expect(user1Level1Mult).to.eq(200);

    await expect(referrals.connect(user2).setReferrer(user1.address, "")).to.not.be.reverted;

    // . SUCCEED: Bronze --> Silver

    // ... Test Self Vol Req
    await points.addPoints(user1.address, e18(900));
    const user1Level2TestA = parseInt(await referrals.getReferrerLevel(user1.address));
    expect(user1Level2TestA).to.eq(1);
    // ... Test Req Vol Req
    await points.addPoints(user2.address, e18(10000));
    const user1Level2TestB = parseInt(await referrals.getReferrerLevel(user1.address));
    expect(user1Level2TestB).to.eq(1);
    // ... Test Refs Req
    await referrals.connect(user3).setReferrer(user1.address, "");
    await referrals.connect(user4).setReferrer(user1.address, "");

    const data = await points.getPointsAndReferralData(user1.address);
    console.log({
      data,
    });

    const user1Level2Test2 = parseInt(await referrals.getReferrerLevel(user1.address));
    expect(user1Level2Test2).to.eq(2);

    const user1Level2 = parseInt(await referrals.getReferrerLevel(user1.address));
    const user1Level2Mult = parseInt(await referrals.getReferrerMultiplier(user1.address));
    expect(user1Level2).to.eq(2);
    expect(user1Level2Mult).to.eq(400);

    console.log({
      user1Level0,
      user1Level1,
    });

    // Add Points (both SELF and REF)
    const pointsToAdd = 1000000;
    await points.addPoints(user1.address, pointsToAdd);
    const user1SelfPoints = parseInt((await points.getPoints(user1.address))[0]);
    const user2RefPoints = parseInt((await points.getPoints(user2.address))[1]);
  });
  it("Get Points And Referral Data");
});
