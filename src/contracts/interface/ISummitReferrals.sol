//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISummitReferrals {

  event UpdatedPointsContract(address indexed _pointsContract);
  event BoostedReferrer(address indexed referrer, uint256 _boostLevel);
  event UpdatedReferrer(address indexed _add, address indexed _referrer);
  event UpdatedLevelData(uint256[] _refPointsReq, uint256[] _selfPointsReq, uint256[] _refsReq, uint256[] _multRew, uint256 _hasReferrerBonusMult);

  function setPointsContract(address _pointsContract) external;
  function setReferrer(address _referrer, string memory _code) external;
  function setReferralCode(string memory _code) external;
  function boostReferrer(address _referrer, uint8 _boostLevel) external;
  function setLevelData(uint256[] memory _refPointsReq, uint256[] memory _selfPointsReq, uint256[] memory _refsReq, uint256[] memory _multRew, uint256 _hasReferrerBonusMult) external;
  function getReferrer(address _add) external view returns (address);
  function getRefsCount(address _add) external view returns (uint256);
  function getReferrerLevel(address _add) external view returns (uint8);
  function getLevelRequirements(uint8 _level) external view returns (uint256 selfVolume, uint256 refVolume, uint256 refsCount);
  function getRefVolumeMultiplier(address _add) external view returns (uint256);
  function getSelfVolumeMultiplier(address _add) external view returns (uint256);
}