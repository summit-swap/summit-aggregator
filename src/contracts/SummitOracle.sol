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
import "./interface/IERC20.sol";
import "./interface/IWETH.sol";
import "./lib/SafeERC20.sol";
import "./lib/Maintainable.sol";
import "./lib/SummitViewUtils.sol";
import "./lib/Recoverable.sol";
import "./lib/SafeERC20.sol";
import "hardhat/console.sol";


contract SummitOracle is Maintainable, Recoverable {
    using SafeERC20 for IERC20;
    using FormattedOfferUtils for FormattedOffer;

    ISummitRouter public ROUTER;
    IERC20 public STABLE;
    IERC20 public WNATIVE;

    constructor(
      address _router,
      address _stable,
      address _wNative
    ) {
      ROUTER = ISummitRouter(_router);
      STABLE = IERC20(_stable);
      WNATIVE = IERC20(_wNative);
    }


    function setRouter(address _router) public onlyMaintainer {
      ROUTER = ISummitRouter(_router);
    }
    function setStable(address _stable) public onlyMaintainer {
      STABLE = IERC20(_stable);
    }
    function setWNative(address _wNative) public onlyMaintainer {
      WNATIVE = IERC20(_wNative);
    }

    function _getDecimals(address _token) internal view returns (uint8) {
      if (_token == address(0)) return 18;
      try IERC20(_token).decimals() returns (uint8 dec) {
        return dec;
      } catch {
        return 18;
      }
    }
    function _getAllowance(address _user, address _token) internal view returns (uint256) {
      if (_user == address(0)) return 0;
      if (_token == address(0)) return _user.balance;
      return IERC20(_token).allowance(_user, address(ROUTER));
    }
    function _getBalance(address _user, address _token) internal view returns (uint256) {
      if (_user == address(0)) return 0;
      if (_token == address(0)) return _user.balance;
      return IERC20(_token).balanceOf(_user);
    }

    function getPrice(address _token) public view returns (uint256, uint256) {
      uint8 decimals = _getDecimals(_token);

      try ROUTER.findBestPath(
        10 ** decimals,
        _token == address(0) ? address(WNATIVE) : _token,
        address(STABLE),
        3
      ) returns (FormattedOffer memory formattedOffer) {
        return (formattedOffer.getAmountOut(), STABLE.decimals());
      } catch {
        return (0, STABLE.decimals());
      }
    }

    struct TokenData {
      address tokenAddress;
      uint256 decimals;
      uint256 userAllowance;
      uint256 userBalance;
      uint256 price;
      uint256 priceDecimals;
    }

    function getTokenData(address _user, address _token) public view returns (TokenData memory token) {
      (uint256 price, uint256 priceDecimals) = getPrice(_token);
      token = TokenData({
        tokenAddress: _token,
        decimals: _getDecimals(_token),
        price: price,
        priceDecimals: priceDecimals,
        userAllowance: _getAllowance(_user, _token),
        userBalance: _getBalance(_user, _token)
      });
    }

    function getTokenAndSwapData(address _user, uint256 _amountIn, address _tokenIn, address _tokenOut, uint256 _maxSteps)
      public view
      returns (TokenData memory token, FormattedOffer memory offer)
    {
      return (
        getTokenData(_user, _tokenIn),
        ROUTER.findBestPath(
          _amountIn,
          _tokenIn == address(0) ? address(WNATIVE) : _tokenIn,
          _tokenOut == address(0) ? address(WNATIVE) : _tokenOut,
          _maxSteps
        )
      );
    }


}
