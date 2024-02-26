//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interface/ISummitReferrals.sol";
import "./interface/ISummitPoints.sol";
import "./interface/IBlast.sol";
import "./lib/Maintainable.sol";

// | Level    | Custom Benefit  | Reward  | Self Volume Required  | Referred Volume Required  | Referral Num Required   |
// | ---      | ---             | ---     | ---                   | ---                       | ---                     |
// | Wood     |                 | 0       | 0                     | 0                         | 0                       |
// | Bronze   | Can refer       | 2%      | 100                   | 0                         | 0                       |
// | Silver   |                 | 3%      | 1000                  | 10000                     | 3                       |
// | Gold     |                 | 5%      | 2000                  | 25000                     | 5                       |
// | Platinum |                 | 7%      | 5000                  | 100000                    | 10                      |
// | Noble    |                 | 10%     | 25000                 | 1000000                   | 25                      |

contract SummitReferrals is Maintainable, ISummitReferrals {
    using SafeMath for uint256;

    address public SUMMIT_POINTS;

    // Level requirements
    uint256 public levelCount = 6;
    mapping(uint256 => uint256) public LEVEL_REF_VOLUME_REQ; // = [0, 0, 10000e18, 25000e18, 100000e18, 1000000e18];
    mapping(uint256 => uint256) public LEVEL_SELF_VOLUME_REQ; // = [0, 100e18, 1000e18, 2000e18, 5000e18, 25000e18];
    mapping(uint256 => uint256) public LEVEL_REFS_REQ; // = [0, 0, 3, 5, 10, 25];

    mapping(uint256 => uint256) public LEVEL_MULT_REWARD; // = [0, 200, 400, 500, 700, 1500];

    uint256 public BONUS_FOR_BEING_REFERRED = 200;
    mapping(address => address) public REFERRER;
    mapping(address => uint256) public REF_COUNT;
    mapping(address => uint8) public REF_BOOST_LEVEL;
    mapping(string => address) public REF_CODE;
    mapping(address => string) public REF_CODE_INV;

    error AlreadyInitialized();
    error MissingReferral();
    error AlreadyReferredByUser();
    error SelfReferral();
    error ReciprocalReferral();
    error LengthMismatch();
    error CodeNotAvailable();
    error MustBeAtLeastBronze();
    error InvalidLevel();

    constructor() {
      uint256[6] memory refVolumeReq = [uint256(0), 0, 10000e18, 25000e18, 100000e18, 1000000e18];
      uint256[6] memory selfVolumeReq = [uint256(0), 100e18, 1000e18, 2000e18, 5000e18, 25000e18];
      uint256[6] memory refsReq = [uint256(0), 0, 3, 5, 10, 25];
      uint256[6] memory multReward = [uint256(0), 200, 500, 500, 700, 1000];

      for (uint256 i = 0; i < levelCount; i++) {
        LEVEL_REF_VOLUME_REQ[i] = refVolumeReq[i];
        LEVEL_SELF_VOLUME_REQ[i] = selfVolumeReq[i];
        LEVEL_REFS_REQ[i] = refsReq[i];
        LEVEL_MULT_REWARD[i] = multReward[i];
      }
    }

    bool public initialized = false;
    address public governor;
    function initialize(address _governor) public onlyMaintainer {
      if (initialized) revert AlreadyInitialized();
      initialized = true;

      // __BLAST__
      // IBlast blast = IBlast(0x4300000000000000000000000000000000000002);
      // __BLAST__
      // blast.configureClaimableGas();
      // __BLAST__
      // blast.configureGovernor(_governor);
      governor = _governor;
    }


    function setPointsContract(address _pointsContract) override public onlyMaintainer {
      emit UpdatedPointsContract(_pointsContract);
      SUMMIT_POINTS = _pointsContract;
    }

    function stringEquals(string memory s1, string memory s2) internal pure returns(bool) {
        return keccak256(abi.encode(s1)) == keccak256(abi.encode(s2));
    }

    function setReferrer(address _referrer, string memory _code) override public {
      // Get referrer from code or argument
      address referrer = _referrer == address(0) ? REF_CODE[_code] : _referrer;

      // Checks
      if (referrer == address(0)) revert MissingReferral();
      if (referrer == msg.sender) revert SelfReferral();
      if (referrer == REFERRER[msg.sender]) revert AlreadyReferredByUser();
      if (REFERRER[referrer] == msg.sender) revert ReciprocalReferral();
      if (REFERRER[REFERRER[referrer]] == msg.sender) revert ReciprocalReferral();

      // Validate referrer is at least bronze level
      if (getReferrerLevel(referrer) == 0) revert MustBeAtLeastBronze();

      // Remove from prev referrer count
      if (REFERRER[msg.sender] != address(0) && REF_COUNT[REFERRER[msg.sender]] >= 1) {
        REF_COUNT[REFERRER[msg.sender]] -= 1;
      }

      REFERRER[msg.sender] = referrer;
      REF_COUNT[referrer] += 1;

      emit UpdatedReferrer(msg.sender, referrer);
    }

    function setReferralCode(string memory _code) override public {
      // Validate referrer is at least bronze level
      if (getReferrerLevel(msg.sender) == 0) revert MustBeAtLeastBronze();

      // If code is already being used
      if (REF_CODE[_code] != address(0)) revert CodeNotAvailable();

      REF_CODE[REF_CODE_INV[msg.sender]] = address(0);
      REF_CODE_INV[msg.sender] = _code;
      REF_CODE[_code] = msg.sender;
    }

    function boostReferrer(address _referrer, uint8 _boostLevel) override public onlyMaintainer {
      REF_BOOST_LEVEL[_referrer] = _boostLevel;
      emit BoostedReferrer(_referrer, _boostLevel);
    }

    function setLevelData(uint256[] memory _refVolumeReq, uint256[] memory _selfVolumeReq, uint256[] memory _refsReq, uint256[] memory _multReward, uint256 _hasReferrerBonusMult) override public onlyMaintainer {
      if (_refVolumeReq.length != _selfVolumeReq.length || _refVolumeReq.length != _refsReq.length || _refVolumeReq.length != _multReward.length) revert LengthMismatch();

      uint256 newLength = _refVolumeReq.length;

      for (uint256 i = 0; i < newLength; i++) {
        LEVEL_REF_VOLUME_REQ[i] = _refVolumeReq[i];
        LEVEL_SELF_VOLUME_REQ[i] = _selfVolumeReq[i];
        LEVEL_REFS_REQ[i] = _refsReq[i];
        LEVEL_MULT_REWARD[i] = _multReward[i];
      }

      levelCount = newLength;

      BONUS_FOR_BEING_REFERRED = _hasReferrerBonusMult;
      emit UpdatedLevelData(_refVolumeReq, _selfVolumeReq, _refsReq, _multReward, _hasReferrerBonusMult);
    }

    function getReferrer(address _add) override public view returns (address) {
      return REFERRER[_add];
    }

    function getReferrerLevel(address _add) override public view returns (uint8) {
      if (REF_BOOST_LEVEL[_add] > 0) {
        return REF_BOOST_LEVEL[_add] > (levelCount - 1) ? uint8(levelCount - 1) : REF_BOOST_LEVEL[_add];
      }
      if (SUMMIT_POINTS == address(0)) return 0;

      (uint256 _selfVolume, uint256 _refVolume,) = ISummitPoints(SUMMIT_POINTS).getVolume(_add);

      for (uint8 i = 0; i < levelCount; i++) {
        if (_selfVolume < LEVEL_SELF_VOLUME_REQ[i + 1]) return i;
        if (_refVolume < LEVEL_REF_VOLUME_REQ[i + 1]) return i;
        if (REF_COUNT[_add] < LEVEL_REFS_REQ[i + 1]) return i;
      }

      return uint8(levelCount);
    }

    function getLevelRequirements(uint8 _level) override public view returns (uint256 selfVolume, uint256 refVolume, uint256 refsCount) {
      if (_level >= levelCount) revert InvalidLevel();
      return (
        LEVEL_SELF_VOLUME_REQ[_level],
        LEVEL_REF_VOLUME_REQ[_level],
        LEVEL_REFS_REQ[_level]
      );
    }

    function getRefsCount(address _add) override public view returns (uint256) {
      return REF_COUNT[_add];
    }

    function getRefVolumeMultiplier(address _add) override public view returns (uint256) {
      return LEVEL_MULT_REWARD[getReferrerLevel(_add)];
    }

    function getSelfVolumeMultiplier(address _add) override public view returns (uint256) {
      return 10000 + (REFERRER[_add] != address(0) ? BONUS_FOR_BEING_REFERRED : 0);
    }
}