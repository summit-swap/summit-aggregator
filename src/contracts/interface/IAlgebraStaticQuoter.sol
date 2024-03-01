// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./IUniV3likeQuoterCore.sol";

struct QuoteExactInputSingleParams {
    address tokenIn;
    address tokenOut;
    uint256 amountIn;
    uint160 sqrtPriceLimitX96;
}

interface IAlgebraStaticQuoter is IUniV3likeQuoterCore {

    function quoteExactInputSingle(
        QuoteExactInputSingleParams memory params
    ) external view returns (uint256 amountOut);

    function quoteExactInput(
        bytes memory path, 
        uint256 amountIn
    ) external view returns (uint256 amountOut);

}

