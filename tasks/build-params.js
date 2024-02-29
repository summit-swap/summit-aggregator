const fs = require("fs");
const { task } = require("hardhat/config");
const oracleConfig = require("../config/oracle");
const adaptersConfig = require("../config/adapters");
const deploymentOptionsConfig = require("../config/deploymentOptions");
const hopTokensConfig = require("../config/hopTokens");
const wNativeConfig = require("../config/wNative");

task("build-params", "Inserts build parameters for subsequent ignite deployment", async (_, hre) => {
  const networkId = hre.network.config.chainId;
  const networkName = hre.network.name;

  const oracle = oracleConfig[networkId];
  const adapters = adaptersConfig[networkId];
  const deploymentOptions = deploymentOptionsConfig[networkId];
  const hopTokens = hopTokensConfig[networkId];
  const wNative = wNativeConfig[networkId];

  const parametersFilePath = `${process.cwd()}/ignition/parameters/${networkName}.json`;

  const parameters = {
    SummitSwapEcosystem: {
      oracle,
      adapters,
      deploymentOptions,
      hopTokens,
      wNative,
    },
  };

  fs.writeFileSync(parametersFilePath, JSON.stringify(parameters, null, 2));
});
