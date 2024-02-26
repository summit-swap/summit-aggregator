const { getTknContractsForNetwork, forkGlobalNetwork, getAccountsGen, deployContract } = require("../helpers");

const { AdapterTestEnv } = require("./adapter-test-env");

module.exports.addresses = require("../../misc/addresses.json");
module.exports.constants = require("../../misc/constants.json");
module.exports.helpers = require("../helpers");

module.exports.setTestEnv = async (networkName, forkBlockNum) => {
  // await forkGlobalNetwork(forkBlockNum, networkName);
  const supportedTkns = await getTknContractsForNetwork(networkName);
  const accountsGen = await getAccountsGen();
  const deployer = accountsGen.next();
  const user1 = accountsGen.next();
  const user2 = accountsGen.next();
  const user3 = accountsGen.next();
  const user4 = accountsGen.next();
  const testEnv = new TestEnv({ supportedTkns, deployer, user1, user2, user3, user4, accountsGen });
  return testEnv;
};

class TestEnv {
  constructor({ supportedTkns, deployer, user1, user2, user3, user4, accountsGen }) {
    this.supportedTkns = supportedTkns;
    this.accountsGen = accountsGen;
    this.deployer = deployer;
    this.user1 = user1;
    this.user2 = user2;
    this.user3 = user3;
    this.user4 = user4;
    this.setTrader(accountsGen.next());
  }

  async setAdapterEnv(contractName, args, deployer) {
    deployer = deployer || this.deployer;
    const adapter = await deployContract(contractName, { args, deployer });
    return new AdapterTestEnv(this, adapter, deployer);
  }

  updateTrader() {
    this.setTrader(this.nextAccount());
  }

  setTrader(newTrader) {
    this.trader = newTrader;
  }

  nextAccount() {
    return this.accountsGen.next();
  }
}
