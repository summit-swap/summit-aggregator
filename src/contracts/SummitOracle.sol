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

    function getPrice(address _token) public view returns (uint256, uint256) {
      uint256 decimals = IERC20(_token).decimals();
      FormattedOffer memory formattedOffer = ROUTER.findBestPath(
        10 ** decimals,
        _token,
        address(STABLE),
        3
      );
      uint256 amountOut = formattedOffer.getAmountOut();
      return (amountOut, STABLE.decimals());
    }

    struct TokenData {
      uint256 userAllowance;
      uint256 userBalance;
      uint256 price;
      uint256 priceDecimals;
    }

    function getTokenData(address _user, address _token) public view returns (TokenData memory data) {
      (uint256 price, uint256 priceDecimals) = getPrice(_token);
      data = TokenData({
        userAllowance: IERC20(_token).allowance(_user, address(ROUTER)),
        userBalance: IERC20(_token).balanceOf(_user),
        price: price,
        priceDecimals: priceDecimals
      });
    }
}
