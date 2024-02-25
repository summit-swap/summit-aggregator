//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

interface ISummitPoints {
  event UpdatedPointsAdapter(address indexed _pointsAdapter);
  event AddedPoints(address indexed _user, uint256 _amount);
  event TransferredPoints(address indexed _executor, address indexed _from, address indexed _to, uint256 _amount);
  event UpdatedDelegate(address indexed _executor, address indexed _user, address indexed _delegate);
  event UpdatedAdapterDelegate(address indexed _adapter, address indexed _delegate);

  function setPointsAdapter(address _pointsAdapter) external;
  function addPoints(address _add, uint256 _amount) external;
  function transferPoints(address _from, address _to) external;
  function setDelegate(address _user, address _delegate) external;
  function setAdapterDelegate(address _adapter, address _delegate) external;
}
