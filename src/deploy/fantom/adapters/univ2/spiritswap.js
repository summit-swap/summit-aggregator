const { deployUniV2Contract, addresses } = require("../../../utils");

const factory = addresses.fantom.univ2.factories.spirit;
const networkName = "fantom";
const name = "SpiritSwapAdapter";
const tags = ["spiritswap"];
const fee = 3;

module.exports = deployUniV2Contract(networkName, tags, name, factory, fee);
