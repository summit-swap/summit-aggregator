//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./interface/ISummitRouter.sol";
import "./interface/ISummitPoints.sol";
import "./interface/ISummitReferrals.sol";
import "./interface/IAdapter.sol";
import "./interface/IERC20.sol";
import "./interface/IWETH.sol";
import "./lib/SafeERC20.sol";
import "./lib/Maintainable.sol";
import "./lib/SummitViewUtils.sol";
import "./lib/Recoverable.sol";
import "./lib/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract SummitPointsData is Maintainable, Recoverable, ISummitPoints {
  using SafeERC20 for IERC20;
  using EnumerableSet for EnumerableSet.AddressSet;

  address public POINTS_ADAPTER;
  address public REFERRALS;
  mapping(address => uint256) public POINTS;
  mapping(address => address) public DELEGATE;

  error ZeroAddress();
  error NotPermitted();

  function setPointsAdapter(address _pointsAdapter) override public onlyMaintainer {
    emit UpdatedPointsAdapter(_pointsAdapter);
    POINTS_ADAPTER = _pointsAdapter;
  }

  function setReferralsContract(address _referrals) override public onlyMaintainer {
    emit UpdatedReferralsContract(_referrals);
    REFERRALS = _referrals;
  }

  function getPoints(address _add) override public view returns (uint256 points, uint8 level) {
    return (
      POINTS[_add],
      REFERRALS == address(0) ?
        0 :
        ISummitReferrals(REFERRALS).getReferrerLevel(POINTS[_add])
    );
  }

  function addPoints(address _add, uint256 _amount) override public {
    if (msg.sender != POINTS_ADAPTER) revert NotPermitted();
    emit AddedPoints(_add, _amount);

    address referrer = REFERRALS == address(0) ? address(0) : ISummitReferrals(REFERRALS).getReferrer(_add);
    uint256 referrerMultiplier = ISummitReferrals(REFERRALS).getReferrerMultiplier(POINTS[referrer]);

    POINTS[_add] += _amount + (referrer != address(0) ? (_amount * 10200 / 10000) : 0);
    
    if (referrer != address(0) && referrerMultiplier > 0) {
      POINTS[referrer] = _amount * referrerMultiplier / 10000;
    }
  }

  function transferPoints(address _from, address _to) override public {
    if (_to == address(0)) revert ZeroAddress();
    if (_from != msg.sender && DELEGATE[_from] != msg.sender) revert NotPermitted();
    uint256 amount = POINTS[_from];
    POINTS[_from] = 0;
    POINTS[_to] = amount;
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