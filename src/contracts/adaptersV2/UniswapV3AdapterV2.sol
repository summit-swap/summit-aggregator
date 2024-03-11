//
//            __               ___ ___    __            _
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_)
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

import { IUniV3Pool, IERC20, UniswapV3AdapterBaseV2 } from "./UniswapV3AdapterBaseV2.sol";

contract UniswapV3AdapterV2 is UniswapV3AdapterBaseV2 {
    constructor(
        string memory _name,
        uint256 _swapGasEstimate,
        uint256 _quoterGasLimit,
        address _quoter,
        address _factory,
        uint24[] memory _defaultFees
    ) UniswapV3AdapterBaseV2(_name, _swapGasEstimate, _quoterGasLimit, _quoter, _factory, _defaultFees) {}

    function uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes calldata) external {
        if (amount0Delta > 0) {
            IERC20(IUniV3Pool(msg.sender).token0()).transfer(msg.sender, uint256(amount0Delta));
        } else {
            IERC20(IUniV3Pool(msg.sender).token1()).transfer(msg.sender, uint256(amount1Delta));
        }
    }
}
