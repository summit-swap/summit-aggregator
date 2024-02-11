require("dotenv").config();
const { ethers, config } = require("hardhat");

const providerFtm = new ethers.providers.JsonRpcProvider(config.networks.fantom);
const { assets } = require("../misc/addresses.json").fantom;

const summitRouterAddressFtm = require("../deployments/fantom/SummitRouter.json").address;
const summitRouterAbi = require("../abis/SummitRouter.json");
const SummitRouter = new ethers.Contract(summitRouterAddressFtm, summitRouterAbi, providerFtm);
const summitOracleAddressFtm = require("../deployments/fantom/SummitOracle.json").address;
const summitOracleAbi = require("../deployments/fantom/SummitOracle.json").abi;
const SummitOracle = new ethers.Contract(summitOracleAddressFtm, summitOracleAbi, providerFtm);

async function testOracle() {
  console.log({
    token: assets.WETH_LZ,
    signer: assets.USDC_LZ,
  });
  const res = await SummitOracle.getTokenData(assets.USDC_LZ, assets.WETH_LZ);
  console.log({
    res,
  });
}

async function query(tknFrom, tknTo, amountIn) {
  const maxHops = 3;
  const gasPrice = ethers.utils.parseUnits("225", "gwei");
  return SummitRouter.findBestPathWithGas(amountIn, tknFrom, tknTo, maxHops, gasPrice, { gasLimit: 1e9 });
}
async function queryNoGas(tknFrom, tknTo, amountIn) {
  const maxHops = 3;
  return SummitRouter.findBestPath(amountIn, tknFrom, tknTo, maxHops, { gasLimit: 1e9 });
}

async function swap(signer, tknFrom, tknTo, amountIn) {
  const queryRes = await query(tknFrom, tknTo, amountIn);
  const amountOutMin = queryRes.amounts[queryRes.amounts.length - 1];
  const fee = 0;
  await SummitRouter.connect(signer)
    .swapNoSplit([amountIn, amountOutMin, queryRes.path, queryRes.adapters], signer.address, fee)
    .then((r) => r.wait())
    .then(console.log);
}

async function exampleQuery() {
  const amountIn = ethers.utils.parseUnits("1", 18);
  const tknFrom = assets.WETH_LZ;
  const tknTo = assets.USDC_LZ;
  const r = await query(tknFrom, tknTo, amountIn);
  console.log(r);

  const rNoGas = await queryNoGas(tknFrom, tknTo, amountIn);
  console.log("no gas", rNoGas);
}

async function exampleSwap() {
  const signer = new ethers.Wallet(process.env.PK_TEST, provider);
  const amountIn = ethers.utils.parseUnits("0.5");
  const tknFrom = "0x5cc61a78f164885776aa610fb0fe1257df78e59b";
  const tknTo = assets.USDC_AXL;
  const r = await swap(signer, tknFrom, tknTo, amountIn);
  console.log(r);
}

exampleQuery();
testOracle();
// exampleSwap()
