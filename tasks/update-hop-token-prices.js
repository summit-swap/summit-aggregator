const { task } = require("hardhat/config");
const { getDeployedContract } = require("../utils/deploymentFetcher");
const { updateReferrerLevelBoosts } = require("../utils/boostedReferrers");
const { zeroAddress } = require("ethereumjs-util");

const zeroAdd = "0x0000000000000000000000000000000000000000";

const eN = (n, e) => {
  return ethers.parseUnits(`${n}`, e);
};

task("update-hop-token-prices", "Updates SummitRouter hop token prices using SummitOracle", async (_, hre) => {
  const networkId = hre.network.config.chainId;
  const [deployer] = await hre.ethers.getSigners();
  const SummitRouter = await getDeployedContract(networkId, "SummitRouter");
  const SummitOracle = await getDeployedContract(networkId, "SummitOracle");

  const tokens = [
    "0x0000000000000000000000000000000000000000", // ETH
    "0x4300000000000000000000000000000000000004", // WETH
    "0x4300000000000000000000000000000000000003", // USDB
  ]; // WETH

  const multifier = (price, decOffset = 0) => {
    return eN(price, 12 + decOffset);
  };

  const mults = [
    multifier(3984), // ETH
    multifier(3984), // WETH
    multifier(1), // USDB
  ];

  await SummitRouter.connect(deployer).setTokenVolumeMultipliers(tokens, mults).then(finale);

  // const trustedTokensCount = parseInt(await SummitRouter.trustedTokensCount());
  // console.log({
  //   trustedTokensCount,
  // });

  // const trustedTokens = await Promise.all(
  //   new Array(trustedTokensCount).fill("").map((_, i) => SummitRouter.TRUSTED_TOKENS(i))
  // );

  // console.log({
  //   trustedTokens,
  // });

  // for (let i = 0; i < trustedTokens.length; i++) {
  //   if (trustedTokens[i] === "0xD5d5350F42CB484036A1C1aF5F2DF77eAFadcAFF") continue;

  //   const res = await SummitOracle.getPrice10Stable(trustedTokens[i]);
  //   console.log({
  //     token: trustedTokens[i],
  //     res,
  //   });
  // }

  // const trustedTokensPricesRaw = await Promise.all(
  //   trustedTokens.map((token) => SummitOracle.getTokenData(zeroAdd, token))
  // );

  // console.log({
  //   trustedTokensPricesRaw,
  // });
});

async function finale(res) {
  console.log(`Transaction pending: ${res.hash}`);
  await res.wait();
  console.log("Done! 🎉");
}
