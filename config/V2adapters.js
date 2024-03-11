module.exports = {
  250: {},
  168587773: {},
  81457: {
    HyperBlastV2Adapter: {
      name: "HyperBlastV2Adapter",
      type: "UniswapV2AdapterV2",
      factory: "0xd97ffc2041a8ab8f6bc4aee7ee8eca485381d088",
      fee: 3,
      gasEstimate: 120000,
    },
    ThrusterV3Adapter: {
      name: "ThrusterV3Adapter",
      type: "UniswapV3AdapterV2",
      factory: "0x71b08f13B3c3aF35aAdEb3949AFEb1ded1016127",
      quoter: "0x273508AeC0144aD26FA62333d535C29BeDB5CF7a",
      defaultFees: [500, 3_000, 10_000],
      gasEstimate: 300000,
      quoterGasLimit: 300000,
    },
  },
};
