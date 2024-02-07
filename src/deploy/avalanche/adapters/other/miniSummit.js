const { deployAdapter } = require("../../../utils");

const networkName = "avalanche";
const tags = ["minisummit"];
const name = "MiniSummitAdapter";
const contractName = "MiniSummitAdapter";

const gasEstimate = 82_000;
const args = [gasEstimate];

module.exports = deployAdapter(networkName, tags, name, contractName, args);
