//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISummitVolumeAdapter {

  event UpdatedRouter(address indexed _router);
  event UpdatedPointsContract(address indexed _pointsContract);

  function addVolume(address _add, uint256 _volume) external;
  function addAdapterVolume(address _adapter, uint256 _volume) external;
  function setRouter(address _router) external;
  function setPointsContract(address _pointsContract) external;
}