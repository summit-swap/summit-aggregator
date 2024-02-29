const { deployUniV2Contract, addresses } = require("../../../utils");

const factory = "0x281EDF8713d1074E3038c8f68A408d47702D07C8";
const networkName = "blast-test";
const name = "BlasterSwapAdapter";
const tags = ["blasterswap"];
const fee = 2;

module.exports = deployUniV2Contract(networkName, tags, name, factory, fee);
