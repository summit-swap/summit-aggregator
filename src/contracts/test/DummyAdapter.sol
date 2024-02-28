//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

import "../interface/IUniswapFactory.sol";
import "../interface/IUniswapPair.sol";
import "../interface/IERC20.sol";
import "../lib/SafeERC20.sol";
import "../SummitAdapter.sol";

contract DummyAdapter is SummitAdapter {
    using SafeERC20 for IERC20;

    IERC20 public A;
    IERC20 public B;

    uint256 AtoBPrice = 50;

    constructor(
        string memory _name,
        uint256 _swapGasEstimate,
        IERC20 tokenA,
        IERC20 tokenB
    ) SummitAdapter(_name, _swapGasEstimate) {
      A = tokenA;
      B = tokenB;
    }

    function _getAmountOut(
        uint256 _amountIn,
        address _tokenIn
    ) internal view returns (uint256 amountOut) {
      if (_tokenIn == address(A)) return _amountIn * AtoBPrice;
      return _amountIn / AtoBPrice;
    }

    function _query(
        uint256 _amountIn,
        address _tokenIn,
        address _tokenOut
    ) internal view override returns (uint256 amountOut) {
      return _getAmountOut(_amountIn, _tokenIn);
    }

    function _swap(
        uint256 _amountIn,
        uint256 _amountOut,
        address _tokenIn,
        address _tokenOut,
        address to
    ) internal override {
        IERC20(_tokenOut).safeTransfer(to, _getAmountOut(_amountIn, _tokenIn));
    }
}
