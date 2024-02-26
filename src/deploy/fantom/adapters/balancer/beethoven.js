const { deployAdapter, addresses } = require("../../../utils");
const beethovenx = addresses.fantom.beethovenx;

const networkName = "fantom";
const tags = ["beethovenx"];
const name = "BeethovenxAdapter";
const contractName = "BalancerV2Adapter";

const gasEstimate = 120000;
const args = [name, beethovenx.vault, Object.values(beethovenx.pools), gasEstimate];

module.exports = deployAdapter(networkName, tags, name, contractName, args);
