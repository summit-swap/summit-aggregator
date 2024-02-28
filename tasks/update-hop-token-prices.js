const { task } = require("hardhat/config");
const { getDeployedContract } = require("../utils/deploymentFetcher");
const { updateReferrerLevelBoosts } = require("../utils/boostedReferrers");
const { zeroAddress } = require("ethereumjs-util");

const zeroAdd = "0x0000000000000000000000000000000000000000";

task("update-hop-token-prices", "Updates SummitRouter hop token prices using SummitOracle", async (_, hre) => {
  const networkId = hre.network.config.chainId;
  const [deployer] = await hre.ethers.getSigners();
  const SummitRouter = await getDeployedContract(networkId, "SummitRouter");
  const SummitOracle = await getDeployedContract(networkId, "SummitOracle");

  const tokens = [
    "0x695921034f0387eAc4e11620EE91b1b15A6A09fE", // WETH_LZ
    "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // WFTM
    "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4", // USDC_AXL
    "0xd226392C23fb3476274ED6759D4a478db3197d82", // USDT_AXL
    "0xD5d5350F42CB484036A1C1aF5F2DF77eAFadcAFF", // DAI_AXL
    "0x28a92dde19d9989f39a49905d7c9c2fac7799bdf", // USDC_LZ
    "0xcc1b99ddac1a33c201a742a1851662e87bc7f22c", // USDT_LZ
  ];

  const fetchedMults = await Promise.all(tokens.map((token) => SummitRouter.TOKEN_VOLUME_MULTIPLIERS(token)));
  console.log({
    fetchedMults,
  });

  const mults = [
    3267.23, // WETH_LZ
    0.4458, // WFTM
    1, // USDC_AXL
    1, // USDT_AXL
    1, // DAI_AXL
    1, // USDC_LZ
    1, // USDT_LZ
  ].map((mult) => mult * 1000000000000);

  // await SummitRouter.connect(deployer).setTokenVolumeMultipliers(tokens, mults).then(finale);

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
