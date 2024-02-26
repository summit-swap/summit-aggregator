//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./interface/ISummitRouter.sol";
import "./interface/IAdapter.sol";
import "./interface/IBlast.sol";
import "./interface/IERC20.sol";
import "./interface/IWETH.sol";
import "./lib/SafeERC20.sol";
import "./lib/Maintainable.sol";
import "./lib/SummitViewUtils.sol";
import "./lib/Recoverable.sol";
import "./interface/ISummitVolumeAdapter.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";


contract SummitRouter is Maintainable, Recoverable, ISummitRouter {
    using SafeERC20 for IERC20;
    using OfferUtils for Offer;
    using EnumerableSet for EnumerableSet.AddressSet;

    address public immutable WNATIVE;
    address public constant NATIVE = address(0);
    string public constant NAME = "SummitRouter";
    uint256 public constant FEE_DENOMINATOR = 1e4;
    uint256 public MIN_FEE = 0;
    address public FEE_CLAIMER;
    address[] public TRUSTED_TOKENS;
    mapping(address => uint256) public TOKEN_VOLUME_MULTIPLIERS; // (token amount * tokenVolumeMultiplier[token]) / 1e12
    address[] public ADAPTERS;
    address public VOLUME_ADAPTER;

    error AlreadyInitialized();

    constructor(
        address[] memory _adapters,
        address[] memory _trustedTokens,
        address _feeClaimer,
        address _wrapped_native,
        address _volumeAdapter
    ) {
        setAllowanceForWrapping(_wrapped_native);
        setTrustedTokens(_trustedTokens);
        setFeeClaimer(_feeClaimer);
        setAdapters(_adapters);
        WNATIVE = _wrapped_native;
        VOLUME_ADAPTER = _volumeAdapter;
    }

    bool public initialized = false;
    address public governor;
    function initialize(address _governor) public onlyMaintainer {
        if (initialized) revert AlreadyInitialized();
        initialized = true;

        // __BLAST__
        // IBlast blast = IBlast(0x4300000000000000000000000000000000000002);
        // __BLAST__
        // blast.configureClaimableGas();
        // __BLAST__
        // blast.configureGovernor(_governor);

        governor = _governor;
    }

    // -- SETTERS --

    function setAllowanceForWrapping(address _wnative) public onlyMaintainer {
        IERC20(_wnative).safeApprove(_wnative, type(uint256).max);
    }

    function setTrustedTokens(address[] memory _trustedTokens) override public onlyMaintainer {
        emit UpdatedTrustedTokens(_trustedTokens);
        TRUSTED_TOKENS = _trustedTokens;
    }

    function setTokenVolumeMultipliers(address[] memory _tokens, uint256[] memory _volumeMultipliers) public onlyMaintainer {
        require(_tokens.length == _volumeMultipliers.length, "SummitRouter: Array length mismatch");
        emit UpdatedTokenVolumeMultipliers(_tokens, _volumeMultipliers);
        for (uint256 i = 0; i < _tokens.length; i++) {
            TOKEN_VOLUME_MULTIPLIERS[_tokens[i]] = _volumeMultipliers[i];
        }
    }

    function setAdapters(address[] memory _adapters) override public onlyMaintainer {
        emit UpdatedAdapters(_adapters);
        ADAPTERS = _adapters;
    }

    function setVolumeAdapter(address _volumeAdapter) override public onlyMaintainer {
        emit UpdatedVolumeAdapter(_volumeAdapter);
        VOLUME_ADAPTER = _volumeAdapter;
    }

    function setMinFee(uint256 _fee) override external onlyMaintainer {
        emit UpdatedMinFee(MIN_FEE, _fee);
        MIN_FEE = _fee;
    }

    function setFeeClaimer(address _claimer) override public onlyMaintainer {
        emit UpdatedFeeClaimer(FEE_CLAIMER, _claimer);
        FEE_CLAIMER = _claimer;
    }

    //  -- GENERAL --

    function trustedTokensCount() override external view returns (uint256) {
        return TRUSTED_TOKENS.length;
    }

    function adaptersCount() override external view returns (uint256) {
        return ADAPTERS.length;
    }

    // Fallback
    receive() external payable {}

    // -- HELPERS --

    function _applyFee(uint256 _amountIn, uint256 _fee) internal view returns (uint256) {
        require(_fee >= MIN_FEE, "SummitRouter: Insufficient fee");
        return (_amountIn * (FEE_DENOMINATOR - _fee)) / FEE_DENOMINATOR;
    }

    function _wrap(uint256 _amount) internal {
        IWETH(WNATIVE).deposit{ value: _amount }();
    }

    function _unwrap(uint256 _amount) internal {
        IWETH(WNATIVE).withdraw(_amount);
    }

    /**
     * @notice Return tokens to user
     * @dev Pass address(0) for NATIVE
     * @param _token address
     * @param _amount tokens to return
     * @param _to address where funds should be sent to
     */
    function _returnTokensTo(
        address _token,
        uint256 _amount,
        address _to
    ) internal {
        if (address(this) != _to) {
            if (_token == NATIVE) {
                payable(_to).transfer(_amount);
            } else {
                IERC20(_token).safeTransfer(_to, _amount);
            }
        }
    }

    function _transferFrom(address token, address _from, address _to, uint _amount) internal {
        if (_from != address(this))
            IERC20(token).safeTransferFrom(_from, _to, _amount);
        else
            IERC20(token).safeTransfer(_to, _amount);
    }
    
    // -- QUERIES --

    /**
     * Query single adapter
     */
    function queryAdapter(
        uint256 _amountIn,
        address _tokenIn,
        address _tokenOut,
        uint8 _index
    ) override external view returns (uint256) {
        IAdapter _adapter = IAdapter(ADAPTERS[_index]);
        uint256 amountOut = _adapter.query(_amountIn, _tokenIn, _tokenOut);
        return amountOut;
    }

    /**
     * Query specified adapters
     */
    function queryNoSplit(
        uint256 _amountIn,
        address _tokenIn,
        address _tokenOut,
        uint8[] calldata _options
    ) override public view returns (Query memory) {
        Query memory bestQuery;
        for (uint8 i; i < _options.length; i++) {
            address _adapter = ADAPTERS[_options[i]];
            uint256 amountOut = IAdapter(_adapter).query(_amountIn, _tokenIn, _tokenOut);
            if (i == 0 || amountOut > bestQuery.amountOut) {
                bestQuery = Query(_adapter, _tokenIn, _tokenOut, amountOut);
            }
        }
        return bestQuery;
    }

    /**
     * Query all adapters
     */
    function queryNoSplit(
        uint256 _amountIn,
        address _tokenIn,
        address _tokenOut
    ) override public view returns (Query memory) {
        Query memory bestQuery;
        for (uint8 i; i < ADAPTERS.length; i++) {
            address _adapter = ADAPTERS[i];
            uint256 amountOut = IAdapter(_adapter).query(_amountIn, _tokenIn, _tokenOut);
            if (i == 0 || amountOut > bestQuery.amountOut) {
                bestQuery = Query(_adapter, _tokenIn, _tokenOut, amountOut);
            }
        }
        return bestQuery;
    }

    /**
     * Return path with best returns between two tokens
     * Takes gas-cost into account
     */
    function findBestPathWithGas(
        uint256 _amountIn,
        address _tokenIn,
        address _tokenOut,
        uint256 _maxSteps,
        uint256 _gasPrice
    ) override external view returns (FormattedOffer memory) {
        require(_maxSteps > 0 && _maxSteps < 5, "SummitRouter: Invalid max-steps");
        Offer memory queries = OfferUtils.newOffer(_amountIn, _tokenIn);
        uint256 gasPriceInExitTkn = _gasPrice > 0 ? getGasPriceInExitTkn(_gasPrice, _tokenOut) : 0;
        queries = _findBestPath(_amountIn, _tokenIn, _tokenOut, _maxSteps, queries, gasPriceInExitTkn);
        if (queries.adapters.length == 0) {
            queries.amounts = "";
            queries.path = "";
        }
        return queries.format();
    }

    // Find the market price between gas-asset(native) and token-out and express gas price in token-out
    function getGasPriceInExitTkn(uint256 _gasPrice, address _tokenOut) internal view returns (uint256 price) {
        // Avoid low-liquidity price appreciation (https://github.com/yieldsummit/summit-aggregator/issues/20)
        FormattedOffer memory gasQuery = findBestPath(1e18, WNATIVE, _tokenOut, 2);
        if (gasQuery.path.length != 0) {
            // Leave result in nWei to preserve precision for assets with low decimal places
            price = (gasQuery.amounts[gasQuery.amounts.length - 1] * _gasPrice) / 1e9;
        }
    }

    /**
     * Return path with best returns between two tokens
     */
    function findBestPath(
        uint256 _amountIn,
        address _tokenIn,
        address _tokenOut,
        uint256 _maxSteps
    ) override public view returns (FormattedOffer memory) {
        require(_maxSteps > 0 && _maxSteps < 5, "SummitRouter: Invalid max-steps");
        Offer memory queries = OfferUtils.newOffer(_amountIn, _tokenIn);
        queries = _findBestPath(_amountIn, _tokenIn, _tokenOut, _maxSteps, queries, 0);
        // If no paths are found return empty struct
        if (queries.adapters.length == 0) {
            queries.amounts = "";
            queries.path = "";
        }
        return queries.format();
    }

    function _findBestPath(
        uint256 _amountIn,
        address _tokenIn,
        address _tokenOut,
        uint256 _maxSteps,
        Offer memory _queries,
        uint256 _tknOutPriceNwei
    ) internal view returns (Offer memory) {
        Offer memory bestOption = _queries.clone();
        uint256 bestAmountOut;
        uint256 gasEstimate;
        bool withGas = _tknOutPriceNwei != 0;

        // First check if there is a path directly from tokenIn to tokenOut
        Query memory queryDirect = queryNoSplit(_amountIn, _tokenIn, _tokenOut);

        if (queryDirect.amountOut != 0) {
            if (withGas) {
                gasEstimate = IAdapter(queryDirect.adapter).swapGasEstimate();
            }
            bestOption.addToTail(queryDirect.amountOut, queryDirect.adapter, queryDirect.tokenOut, gasEstimate);
            bestAmountOut = queryDirect.amountOut;
        }
        // Only check the rest if they would go beyond step limit (Need at least 2 more steps)
        if (_maxSteps > 1 && _queries.adapters.length / 32 <= _maxSteps - 2) {
            // Check for paths that pass through trusted tokens
            for (uint256 i = 0; i < TRUSTED_TOKENS.length; i++) {
                if (_tokenIn == TRUSTED_TOKENS[i]) {
                    continue;
                }
                // Loop through all adapters to find the best one for swapping tokenIn for one of the trusted tokens
                Query memory bestSwap = queryNoSplit(_amountIn, _tokenIn, TRUSTED_TOKENS[i]);
                if (bestSwap.amountOut == 0) {
                    continue;
                }
                // Explore options that connect the current path to the tokenOut
                Offer memory newOffer = _queries.clone();
                if (withGas) {
                    gasEstimate = IAdapter(bestSwap.adapter).swapGasEstimate();
                }
                newOffer.addToTail(bestSwap.amountOut, bestSwap.adapter, bestSwap.tokenOut, gasEstimate);
                newOffer = _findBestPath(
                    bestSwap.amountOut,
                    TRUSTED_TOKENS[i],
                    _tokenOut,
                    _maxSteps,
                    newOffer,
                    _tknOutPriceNwei
                ); // Recursive step
                address tokenOut = newOffer.getTokenOut();
                uint256 amountOut = newOffer.getAmountOut();
                // Check that the last token in the path is the tokenOut and update the new best option if neccesary
                if (_tokenOut == tokenOut && amountOut > bestAmountOut) {
                    if (newOffer.gasEstimate > bestOption.gasEstimate) {
                        uint256 gasCostDiff = (_tknOutPriceNwei * (newOffer.gasEstimate - bestOption.gasEstimate)) /
                            1e9;
                        uint256 priceDiff = amountOut - bestAmountOut;
                        if (gasCostDiff > priceDiff) {
                            continue;
                        }
                    }
                    bestAmountOut = amountOut;
                    bestOption = newOffer;
                }
            }
        }
        return bestOption;
    }

    // -- VOLUME --
    function _applyUserVolume(
        address _from,
        address[] memory _path, 
        uint256[] memory _amounts
    ) internal returns (uint256) {
        if (VOLUME_ADAPTER == address(0)) return 0;

        uint256 volume = 0;
        for (uint256 i = 0; i < _path.length; i++) {
            if (volume == 0 && TOKEN_VOLUME_MULTIPLIERS[_path[i]] != 0) {
                volume = TOKEN_VOLUME_MULTIPLIERS[_path[i]] * _amounts[i] / 1e12;
            }
        }

        if (volume > 0 && VOLUME_ADAPTER != address(0)) {
            ISummitVolumeAdapter(VOLUME_ADAPTER).addVolume(_from, volume);
        }

        return volume;
    }

    function _applyAdapterVolume(
        address _adapter,
        uint256 _volume
    ) internal {
        if (_volume == 0 || VOLUME_ADAPTER == address(0)) return;
        ISummitVolumeAdapter(VOLUME_ADAPTER).addAdapterVolume(_adapter, _volume);
    }

    // -- SWAPPERS --

    function _swapNoSplit(
        Trade calldata _trade,
        address _from,
        address _to,
        uint256 _fee
    ) internal returns (uint256) {
        uint256[] memory amounts = new uint256[](_trade.path.length);
        if (_fee > 0 || MIN_FEE > 0) {
            // Transfer fees to the claimer account and decrease initial amount
            amounts[0] = _applyFee(_trade.amountIn, _fee);
            _transferFrom(_trade.path[0], _from, FEE_CLAIMER, _trade.amountIn - amounts[0]);
        } else {
            amounts[0] = _trade.amountIn;
        }
        _transferFrom(_trade.path[0], _from, _trade.adapters[0], amounts[0]);
        // Get amounts that will be swapped
        for (uint256 i = 0; i < _trade.adapters.length; i++) {
            amounts[i + 1] = IAdapter(_trade.adapters[i]).query(amounts[i], _trade.path[i], _trade.path[i + 1]);
        }

        // Add volume to user
        uint256 volume = _applyUserVolume(_from, _trade.path, amounts);

        require(amounts[amounts.length - 1] >= _trade.amountOut, "SummitRouter: Insufficient output amount");
        for (uint256 i = 0; i < _trade.adapters.length; i++) {
            _applyAdapterVolume(_trade.adapters[i], volume);

            // All adapters should transfer output token to the following target
            // All targets are the adapters, expect for the last swap where tokens are sent out
            address targetAddress = i < _trade.adapters.length - 1 ? _trade.adapters[i + 1] : _to;
            IAdapter(_trade.adapters[i]).swap(
                amounts[i],
                amounts[i + 1],
                _trade.path[i],
                _trade.path[i + 1],
                targetAddress
            );
        }

        

        emit SummitSwap(_trade.path[0], _trade.path[_trade.path.length - 1], _trade.amountIn, amounts[amounts.length - 1]);
        return amounts[amounts.length - 1];
    }

    function swapNoSplit(
        Trade calldata _trade,
        address _to,
        uint256 _fee
    ) override public {
        _swapNoSplit(_trade, msg.sender, _to, _fee);
    }

    function swapNoSplitFromNATIVE(
        Trade calldata _trade,
        address _to,
        uint256 _fee
    ) override external payable {
        require(_trade.path[0] == WNATIVE, "SummitRouter: Path needs to begin with WNATIVE");
        _wrap(_trade.amountIn);
        _swapNoSplit(_trade, address(this), _to, _fee);
    }

    function swapNoSplitToNATIVE(
        Trade calldata _trade,
        address _to,
        uint256 _fee
    ) override public {
        require(_trade.path[_trade.path.length - 1] == WNATIVE, "SummitRouter: Path needs to end with WNATIVE");
        uint256 returnAmount = _swapNoSplit(_trade, msg.sender, address(this), _fee);
        _unwrap(returnAmount);
        _returnTokensTo(NATIVE, returnAmount, _to);
    }

    /**
     * Swap token to token without the need to approve the first token
     */
    function swapNoSplitWithPermit(
        Trade calldata _trade,
        address _to,
        uint256 _fee,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) override external {
        IERC20(_trade.path[0]).permit(msg.sender, address(this), _trade.amountIn, _deadline, _v, _r, _s);
        swapNoSplit(_trade, _to, _fee);
    }

    /**
     * Swap token to NATIVE without the need to approve the first token
     */
    function swapNoSplitToNATIVEWithPermit(
        Trade calldata _trade,
        address _to,
        uint256 _fee,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) override external {
        IERC20(_trade.path[0]).permit(msg.sender, address(this), _trade.amountIn, _deadline, _v, _r, _s);
        swapNoSplitToNATIVE(_trade, _to, _fee);
    }
}
