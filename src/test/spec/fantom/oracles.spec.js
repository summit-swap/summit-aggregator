const { expect } = require("chai");
const { setTestEnv, addresses, helpers } = require("../../utils/test-env");

describe("SummitOracle", function () {
  let testEnv;
  let tkns;
  let oracle; // adapter-test-env

  before(async () => {
    const networkName = "fantom";
    const forkBlockNumber = 75255561;
    testEnv = await setTestEnv(networkName, forkBlockNumber);
    tkns = testEnv.supportedTkns;

    const routerCode = await testEnv.deployer.provider.getCode("0x21506976f76D5999aeF0476d6667a8F011555376");
    console.log({
      routerCode,
      deployer: testEnv.deployer,
    });

    const contractName = "SummitOracle";
    const oracleArgs = ["0x21506976f76D5999aeF0476d6667a8F011555376", tkns.USDC_LZ.address, tkns.WFTM.address];
    oracle = await helpers.deployContract(contractName, { deployer: testEnv.deployer, args: oracleArgs });
  });

  beforeEach(async () => {});

  describe("Oracle", async () => {
    it("Test", async () => {
      const priceData = await oracle.getPrice(tkns.WETH_LZ.address);
      console.log({
        priceData,
      });
      const tokenData = await oracle.getTokenData(
        testEnv.deployer.address,
        "0x40DF1Ae6074C35047BFF66675488Aa2f9f6384F3"
      );
      console.log({
        tokenData,
      });
    });
  });
});
