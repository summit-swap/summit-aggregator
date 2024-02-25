//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./interface/ISummitPointsAdapter.sol";
import "./interface/ISummitPoints.sol";
import "./interface/IAdapter.sol";
import "./interface/IERC20.sol";
import "./interface/IWETH.sol";
import "./lib/SafeERC20.sol";
import "./lib/Maintainable.sol";
import "./lib/SummitViewUtils.sol";
import "./lib/Recoverable.sol";
import "./lib/SafeERC20.sol";


contract SummitPointsAdapter is Maintainable, Recoverable, ISummitPointsAdapter {

  address public ROUTER;
  address public POINTS_CONTRACT;

  error OnlyRouter();

  function addPoints(address _add, uint256 _amount) override public {
    if (msg.sender != ROUTER) revert OnlyRouter();
    if (POINTS_CONTRACT == address(0)) return;
    ISummitPoints(POINTS_CONTRACT).addPoints(_add, _amount);
  }

  function setRouter(address _router) override public onlyMaintainer {
    emit UpdatedRouter(_router);
    ROUTER = _router;
  }

  function setPointsContract(address _pointsContract) override public onlyMaintainer {
    emit UpdatedPointsContract(_pointsContract);
    POINTS_CONTRACT = _pointsContract;
  }
}