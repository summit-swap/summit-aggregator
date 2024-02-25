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
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";


contract SummitPointsData is Maintainable, Recoverable {
  using SafeERC20 for IERC20;
  using EnumerableSet for EnumerableSet.AddressSet;

  mapping(address => uint256) public POINTS;
  mapping(address => address) public DELEGATE;

  error ZeroAddress();
  error NotPermitted();

  event TransferredPoints(address indexed _executor, address indexed _from, address indexed _to, uint256 _amount);
  event UpdatedDelegate(address indexed _executor, address indexed _user, address indexed _delegate);
  event UpdatedAdapterDelegate(address indexed _adapter, address indexed _delegate);

  function transferPoints(address _from, address _to) public {
    if (_to == address(0)) revert ZeroAddress();
    if (_from != msg.sender && DELEGATE[_from] != msg.sender) revert NotPermitted();
    uint256 amount = POINTS[_from];
    POINTS[_from] = 0;
    POINTS[_to] = amount;
    emit TransferredPoints(msg.sender, _from, _to, amount);
  }

  function setDelegate(address _user, address _delegate) public {
    if (_delegate == address(0)) revert ZeroAddress();
    if (_user != msg.sender && DELEGATE[_user] != msg.sender) revert NotPermitted();
    DELEGATE[msg.sender] = _delegate;
    emit UpdatedDelegate(msg.sender, _user, _delegate);
  }

  function setAdapterDelegate(address _adapter, address _delegate) public onlyMaintainer {
    if (_delegate == address(0)) revert ZeroAddress();
    DELEGATE[_adapter] = _delegate;
    emit UpdatedAdapterDelegate(_adapter, _delegate);
  }

}