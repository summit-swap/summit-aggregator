# Integrating Summit Swap routing / swaps

BLAST Mainnet Contract: 0x87AA9f75A54858c32F189C3B60D12d754E7c7b49
Relevant SummitRouter Interface: (full interface found at ./src/contracts/interface/ISummitRouter.sol)

```
interface ISummitRouter {
    function findBestPathWithGas(
        uint256 _amountIn,
        address _tokenIn,
        address _tokenOut,
        uint256 _maxSteps,
        uint256 _gasPrice
    ) external view returns (FormattedOffer memory);

    function swapNoSplit(
        Trade calldata _trade,
        address _to,
        uint256 _fee
    ) external;

    function swapNoSplitFromNATIVE(
        Trade calldata _trade,
        address _to,
        uint256 _fee
    ) external payable;

    function swapNoSplitToNATIVE(
        Trade calldata _trade,
        address _to,
        uint256 _fee
    ) external;

    function swapNoSplitWithPermit(
        Trade calldata _trade,
        address _to,
        uint256 _fee,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external;

    function swapNoSplitToNATIVEWithPermit(
        Trade calldata _trade,
        address _to,
        uint256 _fee,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external;
}

```

!! Important Note: ETH is treated as the zero address, to query or execute a trade like ETH -> USDB, the query & swap must replace use the WETH address, ie: WETH -> USDB. The swap version called (swapNoSplit / swapNoSplitFromNATIVE) determines when wrapping/unwrapping is handled

Routes are fetched by calling `findBestPathWithGas`, which returns a `FormattedOffer`: (calling findBestPathWithGas with `_gasPrice === 0` will return the absolute best trade, regardless of gas price or hop count, this can be far less than ideal occasionally, best left up to the user with a setting)

```
struct FormattedOffer {
    uint256[] amounts;
    address[] adapters;
    address[] path;
    uint256 gasEstimate;
}
```

That data will need to be transformed into a `Trade`:

```
struct Trade {
    uint256 amountIn;
    uint256 amountOut;
    address[] path;
    address[] adapters;
}
```

which can be used in one of the swap functions above. At minimum, `amountIn` should be set to `FormattedOffer.amounts[0]`, and `amountOut` should be set to `FormattedOffer.amounts[last] * (1 - slippage)`. `path` can remain consistent between the `FormattedOffer` and `Trade`, as can `adapters`.

All the swap functions use the same args:

```
function _swapNoSplit(
    Trade calldata _trade,
    address _from,
    address _to,
    uint256 _fee
) ...
```

The only difference being that any of the `...fromNATIVE` functions must also take a payable value (of course).
