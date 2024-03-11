//
//            __               ___ ___    __            _
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_)
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

import { IBlast } from "./interface/IBlast.sol";
import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IAdapterV2 } from "./interface/IAdapterV2.sol";
import { Maintainable } from "./lib/Maintainable.sol";

abstract contract SummitAdapterV2 is Maintainable, IAdapterV2 {
    using SafeERC20 for IERC20;

    uint256 internal constant UINT_MAX = type(uint256).max;
    uint256 public override swapGasEstimate;
    string public override name;

    event SummitAdapterSwap(
        address indexed _tokenFrom,
        address indexed _tokenTo,
        uint256 _amountIn,
        uint256 _amountOut
    );
    event UpdatedGasEstimate(address indexed _adapter, uint256 _newEstimate);
    event Recovered(address indexed _asset, uint256 amount);

    error AlreadyInitialized();
    error SummitAdapter_InvalidAdapterName();
    error SummitAdapter_InvalidGasEstimate();
    error SummitAdapter_NativeTransferFailed();
    error SummitAdapter_NothingToRecover();
    error SummitAdapter_InsufficientAmountOut();

    constructor(string memory _name, uint256 _gasEstimate) {
        setName(_name);
        setSwapGasEstimate(_gasEstimate);
    }

    bool public initialized = false;
    address public governor;
    function initialize(address _governor) public onlyMaintainer {
        if (initialized) revert AlreadyInitialized();
        initialized = true;

        IBlast blast = IBlast(0x4300000000000000000000000000000000000002);
        blast.configureClaimableGas();
        blast.configureGovernor(_governor);

        governor = _governor;
    }

    function setName(string memory _name) internal {
        if (bytes(_name).length == 0) revert SummitAdapter_InvalidAdapterName();
        name = _name;
    }

    function setSwapGasEstimate(uint256 _estimate) public onlyMaintainer {
        if (_estimate == 0) revert SummitAdapter_InvalidGasEstimate();
        swapGasEstimate = _estimate;
        emit UpdatedGasEstimate(address(this), _estimate);
    }

    function revokeAllowance(address _token, address _spender) external onlyMaintainer {
        IERC20(_token).safeApprove(_spender, 0);
    }

    function recoverERC20(address _tokenAddress, uint256 _tokenAmount) external onlyMaintainer {
        if (_tokenAmount == 0) revert SummitAdapter_NothingToRecover();
        IERC20(_tokenAddress).safeTransfer(msg.sender, _tokenAmount);
        emit Recovered(_tokenAddress, _tokenAmount);
    }

    function recoverNATIVE(uint256 _amount) external onlyMaintainer {
        if (_amount == 0) revert SummitAdapter_NothingToRecover();
        payable(msg.sender).transfer(_amount);
        (bool sent, ) = msg.sender.call{ value: _amount }("");
        if (!sent) revert SummitAdapter_NativeTransferFailed();
        emit Recovered(address(0), _amount);
    }

    function query(uint256 _amountIn, address _tokenIn, address _tokenOut) external view override returns (uint256) {
        return _query(_amountIn, _tokenIn, _tokenOut);
    }

    function getTransferTarget(address _tokenIn, address _tokenOut) external view override returns (address) {
        return _getTransferTarget(_tokenIn, _tokenOut);
    }

    function swap(
        uint256 _amountIn,
        uint256 _amountOut,
        address _fromToken,
        address _toToken,
        address _to
    ) external virtual override {
        uint256 toBal0 = IERC20(_toToken).balanceOf(_to);
        _swap(_amountIn, _amountOut, _fromToken, _toToken, _to);
        uint256 diff = IERC20(_toToken).balanceOf(_to) - toBal0;
        if (diff < _amountOut) revert SummitAdapter_InsufficientAmountOut();
        emit SummitAdapterSwap(_fromToken, _toToken, _amountIn, _amountOut);
    }

    function _returnTo(address _token, uint256 _amount, address _to) internal {
        if (address(this) != _to) IERC20(_token).safeTransfer(_to, _amount);
    }

    function _swap(
        uint256 _amountIn,
        uint256 _amountOut,
        address _fromToken,
        address _toToken,
        address _to
    ) internal virtual;

    function _getTransferTarget(address _tokenIn, address _tokenOut) internal view virtual returns (address);

    function _query(uint256 _amountIn, address _tokenIn, address _tokenOut) internal view virtual returns (uint256);

    receive() external payable {}
}
