//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./interface/ISummitPoints.sol";
import "./interface/ISummitReferrals.sol";
import "./interface/IBlast.sol";
import "./lib/Maintainable.sol";
import "./lib/SummitViewUtils.sol";
import "./lib/Recoverable.sol";


contract SummitPointsData is Maintainable, Recoverable, ISummitPoints {

  address public POINTS_ADAPTER;
  address public REFERRALS;
  mapping(address => uint256) public SELF_POINTS;
  mapping(address => uint256) public REF_POINTS;
  mapping(address => address) public DELEGATE;

  error AlreadyInitialized();
  error ZeroAddress();
  error NotPermitted();

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

  function setPointsAdapter(address _pointsAdapter) override public onlyMaintainer {
    emit UpdatedPointsAdapter(_pointsAdapter);
    POINTS_ADAPTER = _pointsAdapter;
  }

  function setReferralsContract(address _referrals) override public onlyMaintainer {
    emit UpdatedReferralsContract(_referrals);
    REFERRALS = _referrals;
  }

  function getPoints(address _add) override public view returns (uint256 selfPoints, uint256 refPoints) {
    return (
      SELF_POINTS[_add],
      REF_POINTS[_add]
    );
  }

  function getPointsAndReferralData(address _add) override public view returns (uint256 selfPoints, uint256 refPoints, uint256 refCount, uint8 level) {
    if (REFERRALS == address(0)) {
      return (
        SELF_POINTS[_add],
        REF_POINTS[_add],
        0,
        0
      );
    }
    return (
      SELF_POINTS[_add],
      REF_POINTS[_add],
      ISummitReferrals(REFERRALS).getRefsCount(_add),
      ISummitReferrals(REFERRALS).getReferrerLevel(_add)
    );
  }

  function addPoints(address _add, uint256 _amount) override public {
    if (msg.sender != POINTS_ADAPTER) revert NotPermitted();
    emit AddedPoints(_add, _amount);

    if (REFERRALS == address(0)) {
      SELF_POINTS[_add] += _amount;
      return;
    }

    SELF_POINTS[_add] += ISummitReferrals(REFERRALS).getAmountWithReferredBonus(_add, _amount);

    (address referrer, uint256 refPoints) = ISummitReferrals(REFERRALS).getReferrerAndPoints(_add, _amount);
    if (refPoints > 0) {
      REF_POINTS[referrer] += refPoints;
    }
  }

  function transferPoints(address _from, address _to) override public {
    if (_to == address(0)) revert ZeroAddress();
    if (_from != msg.sender && DELEGATE[_from] != msg.sender) revert NotPermitted();
    uint256 amount = SELF_POINTS[_from];
    SELF_POINTS[_from] = 0;
    SELF_POINTS[_to] = amount;
    emit TransferredPoints(msg.sender, _from, _to, amount);
  }

  function setDelegate(address _user, address _delegate) override public {
    if (_delegate == address(0)) revert ZeroAddress();
    if (_user != msg.sender && DELEGATE[_user] != msg.sender) revert NotPermitted();
    DELEGATE[msg.sender] = _delegate;
    emit UpdatedDelegate(msg.sender, _user, _delegate);
  }

  function setAdapterDelegate(address _adapter, address _delegate) override public onlyMaintainer {
    if (_delegate == address(0)) revert ZeroAddress();
    DELEGATE[_adapter] = _delegate;
    emit UpdatedAdapterDelegate(_adapter, _delegate);
  }

}