module.exports = {
  250: {
    SpookySwapAdapter: {
      name: "SpookySwapAdapter",
      type: "UniswapV2Adapter",
      factory: "0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3",
      fee: 2,
      gasEstimate: 120000,
    },
    SpiritSwapAdapter: {
      name: "SpiritSwapAdapter",
      type: "UniswapV2Adapter",
      factory: "0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3",
      fee: 3,
      gasEstimate: 120000,
    },
    BeethovenXAdapter: {
      name: "BeethovenXAdapter",
      type: "BalancerV2Adapter",
      gasEstimate: 280000,
      vault: "0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce",
      pools: {
        fantomOfTheOpera: "0xcdF68a4d525Ba2E90Fe959c74330430A5a6b8226",
        loveThyStables: "0x46E578B73a95e62423CE26056aa750bB9D99be32",
        ghostlySonata: "0x26Fa2e6E489b10669ACe976B5815508943D2a8E3",
      },
    },
  },
  168587773: {
    BlasterSwapAdapter: {
      name: "BlasterSwapAdapter",
      type: "UniswapV2Adapter",
      factory: "0x281EDF8713d1074E3038c8f68A408d47702D07C8",
      fee: 2,
      gasEstimate: 120000,
    },
  },
};
