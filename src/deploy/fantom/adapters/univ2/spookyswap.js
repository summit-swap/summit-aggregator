const { deployUniV2Contract, addresses } = require("../../../utils");

const factory = addresses.fantom.univ2.factories.spooky;
const networkName = "fantom";
const name = "SpookySwapAdapter";
const tags = ["spookyswap"];
const fee = 2;

module.exports = deployUniV2Contract(networkName, tags, name, factory, fee);
