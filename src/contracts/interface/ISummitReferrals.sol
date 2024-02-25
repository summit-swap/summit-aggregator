//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISummitReferrals {

  event UpdatedReferrer(address indexed _add, address indexed _referrer);
  event UpdatedLevelData(uint256[] _points, uint256[] _mult, uint256 _hasReferrerBonusMult);

  function setReferrer(address _referrer) external;
  function setLevelData(uint256[] memory _points, uint256[] memory _mult, uint256 _hasReferrerBonusMult) external;
  function getReferrer(address _add) external view returns (address);
  function getReferrerLevel(uint256 _points) external view returns (uint8);
  function getReferrerMultiplier(uint256 _points) external view returns (uint256);
}