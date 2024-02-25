//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISummitReferrals {

  event UpdatedReferrer(address indexed _add, address indexed _referrer);
  event UpdatedLevelData(uint256[] _refPointsReq, uint256[] _selfPointsReq, uint256[] _refsReq, uint256[] _multRew, uint256 _hasReferrerBonusMult);

  function setReferrer(address _referrer) external;
  function setLevelData(uint256[] memory _refPointsReq, uint256[] memory _selfPointsReq, uint256[] memory _refsReq, uint256[] memory _multRew, uint256 _hasReferrerBonusMult) external;
  function getReferrer(address _add) external view returns (address);
  function getReferrerLevel(uint256 _points) external view returns (uint8);
  function getReferrerMultiplier(uint256 _points) external view returns (uint256);
}