const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const BlastRootModule = require("../ignition/modules/blast/Root");
let zeroAdd = "0x0000000000000000000000000000000000000000";

async function deployBlastRootModule() {
  return ignition.deploy(BlastRootModule);
}

it("should set the start count to 0 by default", async function () {
  const counter = await loadFixture(deployBlastRootModule);

  return { counter };
});

describe("Queries", function () {});
