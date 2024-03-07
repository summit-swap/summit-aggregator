require("dotenv").config();
require("@nomicfoundation/hardhat-ignition");
require("@nomicfoundation/hardhat-ignition-ethers");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-foundry");
const tdly = require("@tenderly/hardhat-tenderly");
tdly.setup();

// Tasks
require("./tasks/tenderly-verify");
require("./tasks/test-queries");
require("./tasks/update-adapters-2");
require("./tasks/check-bal");
require("./tasks/update-token-bonuses");
require("./tasks/sync-adapters");
require("./tasks/build-params");
require("./tasks/update-referrer-level-boosts");
require("./tasks/update-hop-token-prices");
require("./src/tasks/update-hop-tokens");
require("./src/tasks/update-adapters");
require("./src/tasks/find-best-path");
require("./src/tasks/find-best-path-wrapped");
require("./src/tasks/list-adapters");

const AVALANCHE_RPC = getEnvValSafe("AVALANCHE_RPC");
const FUJI_RPC = getEnvValSafe("FUJI_RPC");
const ARBITRUM_RPC = getEnvValSafe("ARBITRUM_RPC");
const OPTIMISM_RPC = getEnvValSafe("OPTIMISM_RPC");
const AURORA_RPC = getEnvValSafe("AURORA_RPC");
const DOGECHAIN_RPC = getEnvValSafe("DOGECHAIN_RPC");
const MANTLE_RPC = getEnvValSafe("MANTLE_RPC");
const BLAST_TEST_RPC = getEnvValSafe("BLAST_TEST_RPC");
const BLAST_RPC = getEnvValSafe("BLAST_RPC");
const FANTOM_RPC = getEnvValSafe("FANTOM_RPC");

const AVALANCHE_PK_DEPLOYER = getEnvValSafe("AVALANCHE_PK_DEPLOYER");
const ARBITRUM_PK_DEPLOYER = getEnvValSafe("ARBITRUM_PK_DEPLOYER");
const OPTIMISM_PK_DEPLOYER = getEnvValSafe("OPTIMISM_PK_DEPLOYER");
const AURORA_PK_DEPLOYER = getEnvValSafe("AURORA_PK_DEPLOYER");
const DOGECHAIN_PK_DEPLOYER = getEnvValSafe("DOGECHAIN_PK_DEPLOYER");
const MANTLE_PK_DEPLOYER = getEnvValSafe("MANTLE_PK_DEPLOYER");
const BLAST_TEST_PK_DEPLOYER = getEnvValSafe("BLAST_TEST_PK_DEPLOYER");
const BLAST_PK_DEPLOYER = getEnvValSafe("BLAST_PK_DEPLOYER");
const FANTOM_PK_DEPLOYER = getEnvValSafe("FANTOM_PK_DEPLOYER");

const ETHERSCAN_API_KEY = getEnvValSafe("ETHERSCAN_API_KEY", false);
const FANTOM_API_KEY = getEnvValSafe("FANTOM_API_KEY");
const BLAST_API_KEY = getEnvValSafe("BLAST_API_KEY");

function getEnvValSafe(key, required = true) {
  const endpoint = process.env[key];
  if (!endpoint && required) throw `Missing env var ${key}`;
  return endpoint;
}

module.exports = {
  mocha: {
    timeout: 1e6,
    recursive: true,
    spec: ["test/*.spec.js"],
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: {
      blast: BLAST_API_KEY,
    },
    customChains: [
      {
        network: "blast",
        chainId: 81457,
        urls: {
          apiURL: "https://api.blastscan.io/api",
          browserURL: BLAST_RPC,
        },
      },
    ],
  },
  defaultNetwork: "hardhat",
  ignition: {
    blockPollingInterval: 1000,
    timeBeforeBumpingFees: 3 * 60 * 1000,
    maxFeeBumps: 4,
    requiredConfirmations: 5,
  },
  networks: {
    hardhat: {
      chainId: 250,
      forking: {
        url: FANTOM_RPC,
        blockNumber: 75255561,
      },
      accounts: {
        accountsBalance: "10000000000000000000000000",
        count: 200,
      },
    },
    avalanche: {
      chainId: 43114,
      url: AVALANCHE_RPC,
      accounts: [AVALANCHE_PK_DEPLOYER],
    },
    fuji: {
      chainId: 43113,
      url: FUJI_RPC,
      accounts: [AVALANCHE_PK_DEPLOYER],
    },
    arbitrum: {
      chainId: 42161,
      url: ARBITRUM_RPC,
      accounts: [ARBITRUM_PK_DEPLOYER],
    },
    optimism: {
      chainId: 10,
      url: OPTIMISM_RPC,
      accounts: [OPTIMISM_PK_DEPLOYER],
    },
    aurora: {
      chainId: 1313161554,
      url: AURORA_RPC,
      accounts: [AURORA_PK_DEPLOYER],
    },
    dogechain: {
      chainId: 2000,
      url: DOGECHAIN_RPC,
      accounts: [DOGECHAIN_PK_DEPLOYER],
    },
    mantle: {
      chainId: 5000,
      url: MANTLE_RPC,
      accounts: [MANTLE_PK_DEPLOYER],
    },
    "blast-test": {
      chainId: 168587773,
      url: BLAST_TEST_RPC,
      accounts: [BLAST_TEST_PK_DEPLOYER],
    },
    blast: {
      chainId: 81457,
      url: BLAST_RPC,
      gasPrice: 100000000,
      accounts: [BLAST_PK_DEPLOYER],
    },
    fantom: {
      chainId: 250,
      url: FANTOM_RPC,
      accounts: [FANTOM_PK_DEPLOYER],
    },
    tenderly: {
      chainId: 81457,
      url: "https://rpc.tenderly.co/fork/3329a3e2-5962-4652-b92e-f8257748af8e",
      accounts: [FANTOM_PK_DEPLOYER],
    },
  },
  paths: {
    deployments: "./src/deployments",
    artifacts: "./src/artifacts",
    sources: "./src/contracts",
    deploy: "./src/deploy",
    cache: "./src/cache",
    tests: "./src/test",
  },
  abiExporter: {
    path: "./abis",
    clear: true,
    flat: true,
  },
  contractSizer: {
    disambiguatePaths: false,
    runOnCompile: false,
    alphaSort: false,
  },
  gasReporter: {
    showTimeSpent: true,
    enabled: false,
    gasPrice: 225,
  },
  tenderly: {
    project: "project",
    username: "Halftone",
    forkNetwork: "3329a3e2-5962-4652-b92e-f8257748af8e",
    privateVerification: true,
  },
};
