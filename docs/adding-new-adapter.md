# Adding new adapter

## About

#### Purpose of adapter

Adapter server as a common interface for external contracts to perform queries and swaps.

SummitRouter uses adapter to find the best offer between two tokens for a given amount and execute this offer. It also accounts for query&swap gas-cost of the offer and for that needs gasEstimate from the adapter.

#### Adapter must expose:

- `query(uint256 amountIn, address tokenIn, address tokenOut) returns (uint256 minAmountOut)`
  Returns amount user receives after swap. Exact amount or less. Latter case can happen due to imprecision of certain external queries. Query should never return more than what is swapped.
- `swap(uint256 amountIn, uint256 minAmountOut, address tokenIn , address tokenOut, address to)`
  Executes swap and transfers `tokenOut` to `to` address
- `gasEstimate() returns (uint256)`
  Returns rough gas estimate for querying and swapping through the adapter

###### Multiple pools in adapter

For SummitRouter adapter also acts as identifier(address) where given offer can be swapped. If multiple pools are referenced through single adapter they should be distinguishable by tokenIn-tokenOut combination.

For example: UniswapV2 offers factory method through which token combination is mapped to the corresponding pool. Mapping is injective (only one pool for token combination). Swap method can unambiguously reference tokenIn&tokenTo to a pool to swap through. Contrary, KyberDex factory maps token combination to a list of pools. Here swap method can't know through which pool user wants to swap through.

The limitation can be overcome by having one adapter for each pool or by finding best pool to swap through in the swap method itself.

## Contract

Use boilerplate below as a starting point for developing an adapter.

```solidity


//
//            __               ___ ___    __            _
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_)
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |
//


//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

import "../lib/SafeERC20.sol";
import "../SummitAdapter.sol";


contract ExampleAdapter is SummitAdapter {
    using SafeERC20 for IERC20;

    constructor(
        string memory name,
        uint256 _swapGasEstimate,
        ...
    ) SummitAdapter(name, _swapGasEstimate) {
        // init vars, set allowances ...
    }

    function _query(
        uint256 _amountIn,
        address _tokenIn,
        address _tokenOut
    ) internal view override returns (uint256 amountOut) {
        if (_validPath(_amountIn, _tokenIn, _tokenOut))
            return 0;
        // perform query ...
    }

    function _validPath() internal view returns (bool) {
        // check if token combination and amountIn is valid for the pool
    }

    function _swap(
        uint256 _amountIn,
        uint256 _amountOut,
        address _tokenIn,
        address _tokenOut,
        address _to
    ) internal override {
        // execute swap ...
        // if external contract doesn't check minAmountOut is matched
        // then check bal of this contract is gte _amountOut
        _returnTo(_tokenOut, shares, _to);
    }

}
```
