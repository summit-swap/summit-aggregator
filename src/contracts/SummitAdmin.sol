//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./interface/ISummitRouter.sol";
import "./interface/ISummitReferrals.sol";
import "./interface/ISummitPoints.sol";
import "./interface/IBlast.sol";
import "./lib/Maintainable.sol";

interface ISummitRouterExt {
  function setTokenVolumeMultipliers(address[] memory _tokens, uint256[] memory _volumeMultipliers) external;
  function setTokenBonusMultipliers(address[] memory _tokens, uint256[] memory _multipliers) external;
}


contract SummitAdmin is Maintainable {

  ISummitRouterExt public router;
  ISummitReferrals public referrals;
  ISummitPoints public points;


  constructor(address _router, address _referrals, address _points) {
    router = ISummitRouterExt(_router);
    referrals = ISummitReferrals(_referrals);
    points = ISummitPoints(_points);
  }

  error AlreadyInitialized();
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

  // Router

  function router_setTokenVolumeMultipliers(address[] memory _tokens, uint256[] memory _mults) public onlyMaintainer {
    router.setTokenVolumeMultipliers(_tokens,_mults);
  }
  function router_updateTokenVolumeMultipliers(address[] memory _tokens, uint256[] memory _mults) public onlyMaintainer {
    router.setTokenBonusMultipliers(_tokens,_mults);
  }

  // Referrals

  function referrals_overrideReferralCode(address _add, string memory _code) public onlyMaintainer {
    referrals.maintainerSetReferralCode(_add, _code);
  }
  function referrals_boostReferrer(address _referrer, uint8 _boostLevel) public onlyMaintainer {
    referrals.boostReferrer(_referrer, _boostLevel);
  }

  // Points

  function points_setBlacklisted(address _add, bool _blacklisted) public onlyMaintainer {
    points.setBlacklisted(_add, _blacklisted);
  }
  function points_setGlobalBoost(uint256 _boost) public onlyMaintainer {
    points.setGlobalBoost(_boost);
  }
  function points_summitTeamGivePoints(address _add, uint256 _points) public onlyMaintainer {
    points.summitTeamGivePoints(_add, _points);
  }
  function points_addVolume(address _add, uint256 _points) public onlyMaintainer {
    points.addVolume(_add, _points);
  }
  function points_addAdapterVolume(address _add, uint256 _points) public onlyMaintainer {
    points.addAdapterVolume(_add, _points);
  }
}