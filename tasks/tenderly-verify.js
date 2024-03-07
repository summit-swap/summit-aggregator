const { task } = require("hardhat/config");
const { getDeployedContract } = require("../utils/deploymentFetcher");
const { updateAdapters } = require("../utils/adapters");
const { readFileSync } = require("fs");

task("tenderly-verify", "Verify contracts on tenderly", async (_, hre) => {
  const networkId = hre.network.config.chainId;
  const [deployer] = await hre.ethers.getSigners();
  const SummitRouter = await getDeployedContract(networkId, "SummitRouter");

  const FORK_ID = "3329a3e2-5962-4652-b92e-f8257748af8e";
  const PROJECT_SLUG = "project";
  const USERNAME = "Halftone";

  tenderly.verifyForkAPI(
    {
      config: {
        compiler_version: "0.8.4",
        evm_version: "default",
        optimizations_count: 999,
        optimizations_used: true,
      },
      root: "",
      contracts: [
        {
          contractName: "SummitRouter",
          source: readFileSync("src/contracts/SummitRouter.sol", "utf-8").toString(),
          sourcePath: "src/contracts/SummitRouter.sol",
          networks: {
            // important: key is the Fork ID (UUID-like string)
            [FORK_ID]: {
              address: SummitRouter.target,
              links: {},
            },
          },
        },
      ],
    },
    PROJECT_SLUG,
    USERNAME,
    FORK_ID
  );
});
