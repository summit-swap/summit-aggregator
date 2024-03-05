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


contract SummitOracleV2 is Maintainable, Recoverable {
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
    

    function _getSymbol(address _token) internal view returns (string memory) {
      if (_token == address(0)) return "";
      try IERC20(_token).symbol() returns (string memory sym) {
        return sym;
      } catch {
        return "";
      }
    }
    function _getName(address _token) internal view returns (string memory) {
      if (_token == address(0)) return "";
      try IERC20(_token).name() returns (string memory name) {
        return name;
      } catch {
        return "";
      }
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

    function _getBonus(address _token) internal view returns (uint256) {
      if (_token == address(0)) return 0;
      return ROUTER.getTokenBonus(_token);
    }


    function getPrice10Stable(address _token) public view returns (uint256) {
      try ROUTER.findBestPath(
        10 ** STABLE.decimals(),
        address(STABLE),
        _token == address(0) ? address(WNATIVE) : _token,
        3
      ) returns (FormattedOffer memory formattedOffer) {
        return formattedOffer.getAmountOut();
      } catch {
        return 0;
      }
    }

    function getPriceNwNative(address _token, uint256 _nWnative) public view returns (uint256) {
      // NATIVE (represented by address(0)) will always equal WNATIVE price
      if (_token == address(0) || _token == address(WNATIVE)) return _nWnative;

      try ROUTER.findBestPath(
        _nWnative,
        address(WNATIVE),
        _token,
        3
      ) returns (FormattedOffer memory formattedOffer) {
        return formattedOffer.getAmountOut();
      } catch {
        return 0;
      }
    }

    struct TokenData {
      address tokenAddress;
      string symbol;
      string name;
      uint256 decimals;
      uint256 bonus;
      uint256 userAllowance;
      uint256 userBalance;
      uint256 price;
    }

    function getTokenData(address _user, address _token, uint256 _nWnative) public view returns (TokenData memory token) {
      token = TokenData({
        tokenAddress: _token,
        symbol: _getSymbol(_token),
        name: _getName(_token),
        decimals: _getDecimals(_token),
        bonus: _getBonus(_token),
        price: _nWnative > 0 ? getPriceNwNative(_token, _nWnative) : 0,
        userAllowance: _getAllowance(_user, _token),
        userBalance: _getBalance(_user, _token)
      });
    }

    function getSwapData(uint256 _amountIn, address _tokenIn, address _tokenOut, uint256 _maxSteps, uint256 _gasPrice)
      public view
      returns (FormattedOffer memory offer)
    {
      return (
        ROUTER.findBestPathWithGas(
          _amountIn,
          _tokenIn == address(0) ? address(WNATIVE) : _tokenIn,
          _tokenOut == address(0) ? address(WNATIVE) : _tokenOut,
          _maxSteps,
          _gasPrice
        )
      );
    }


}
