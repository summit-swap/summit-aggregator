//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISummitPointsAdapter {
  function addPoints(address _add, uint256 _amount) external;
  function setRouter(address _router) external;
  function setDataContract(address _dataContract) external;
}