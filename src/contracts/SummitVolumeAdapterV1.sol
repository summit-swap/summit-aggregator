//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./interface/ISummitVolumeAdapter.sol";
import "./interface/ISummitPoints.sol";
import "./interface/IAdapter.sol";
import "./interface/IBlast.sol";
import "./interface/IERC20.sol";
import "./interface/IWETH.sol";
import "./lib/SafeERC20.sol";
import "./lib/Maintainable.sol";
import "./lib/SummitViewUtils.sol";
import "./lib/Recoverable.sol";
import "./lib/SafeERC20.sol";


contract SummitVolumeAdapterV1 is Maintainable, Recoverable, ISummitVolumeAdapter {

  address public ROUTER;
  address public POINTS_CONTRACT;

  error OnlyRouter();
  error AlreadyInitialized();

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


  function setRouter(address _router) override public onlyMaintainer {
    emit UpdatedRouter(_router);
    ROUTER = _router;
  }

  function setPointsContract(address _pointsContract) override public onlyMaintainer {
    emit UpdatedPointsContract(_pointsContract);
    POINTS_CONTRACT = _pointsContract;
  }

  function addVolume(address _add, uint256 _volume) override public {
    if (msg.sender != ROUTER) revert OnlyRouter();
    if (POINTS_CONTRACT == address(0)) return;
    ISummitPoints(POINTS_CONTRACT).addVolume(_add, _volume);
  }

  function addAdapterVolume(address _add, uint256 _volume) override public {
    if (msg.sender != ROUTER) revert OnlyRouter();
    if (POINTS_CONTRACT == address(0)) return;
    ISummitPoints(POINTS_CONTRACT).addAdapterVolume(_add, _volume);
  }
}
