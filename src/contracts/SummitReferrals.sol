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
import "./lib/Maintainable.sol";



// | Level    | Custom Benefit  | Reward  | Self Volume Required  | Referred Volume Required  | Referral Num Required   |
// | ---      | ---             | ---     | ---                   | ---                       | ---                     |
// | Wood     |                 | 0       | 0                     | 0                         | 0                       |
// | Bronze   | Can refer       | 0       | 100                   | 0                         | 0                       |
// | Silver   |                 | 4%      | 1000                  | 10000                     | 3                       |
// | Gold     |                 | 5%      | 2000                  | 25000                     | 5                       |
// | Platinum |                 | 7%      | 5000                  | 100000                    | 10                      |
// | Noble    |                 | 15%     | 25000                 | 1000000                   | 25                      |

contract SummitReferrals is Maintainable, ISummitReferrals {
    using SafeMath for uint256;

    address public SUMMIT_POINTS;

    // Level requirements
    uint256[] public LEVEL_REF_POINTS_REQ = [0, 0, 10000e18, 25000e18, 100000e18, 1000000e18];
    uint256[] public LEVEL_SELF_POINTS_REQ = [0, 100e18, 1000e18, 2000e18, 5000e18, 25000e18];
    uint256[] public LEVEL_REFS_REQ = [0, 0, 3, 5, 10, 25];

    uint256[] public LEVEL_MULT_REWARD = [0, 200, 400, 500, 700, 1500];

    uint256 public BONUS_FOR_BEING_REFERRED = 200;
    mapping(address => address) public REFERRER;
    mapping(address => uint256) public REF_COUNT;
    mapping(address => uint8) public REF_BOOST_LEVEL;
    mapping(string => address) public REF_CODE;
    mapping(address => string) public REF_CODE_INV;
    uint256 GLOBAL_BOOST;

    error MissingReferral();
    error SelfReferral();
    error ReciprocalReferral();
    error LengthMismatch();
    error CodeNotAvailable();


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
      if(referrer == msg.sender) revert SelfReferral();
      if(REFERRER[referrer] == msg.sender) revert ReciprocalReferral();
      if(REFERRER[REFERRER[referrer]] == msg.sender) revert ReciprocalReferral();

      // Remove from prev referrer count
      if (REFERRER[msg.sender] != address(0) && REF_COUNT[REFERRER[msg.sender]] > 1) {
        REF_COUNT[REFERRER[msg.sender]] -= 1;
      }

      REFERRER[msg.sender] = referrer;
      REF_COUNT[referrer] += 1;

      emit UpdatedReferrer(msg.sender, referrer);
    }

    function setReferralCode(string memory _code) override public {
      if (REF_CODE[_code] != address(0)) revert CodeNotAvailable();
      REF_CODE[REF_CODE_INV[msg.sender]] = address(0);
      REF_CODE_INV[msg.sender] = _code;
      REF_CODE[_code] = msg.sender;
    }

    function boostReferrer(address _referrer, uint8 _boostLevel) override public onlyMaintainer {
      REF_BOOST_LEVEL[_referrer] = _boostLevel;
      emit BoostedReferrer(_referrer, _boostLevel);
    }

    function setGlobalBoost(uint256 _boost) override public onlyMaintainer {
      GLOBAL_BOOST = _boost;
      emit UpdatedGlobalBoost(_boost);
    }

    function setLevelData(uint256[] memory _refPointsReq, uint256[] memory _selfPointsReq, uint256[] memory _refsReq, uint256[] memory _multRew, uint256 _hasReferrerBonusMult) override public onlyMaintainer {
      if (_refPointsReq.length != _selfPointsReq.length || _refPointsReq.length != _refsReq.length || _refPointsReq.length != _multRew.length) revert LengthMismatch();
      LEVEL_REF_POINTS_REQ = _refPointsReq;
      LEVEL_SELF_POINTS_REQ = _selfPointsReq;
      LEVEL_REFS_REQ = _refsReq;
      LEVEL_MULT_REWARD = _multRew;
      BONUS_FOR_BEING_REFERRED = _hasReferrerBonusMult;
      emit UpdatedLevelData(_refPointsReq, _selfPointsReq, _refsReq, _multRew, _hasReferrerBonusMult);
    }

    function getReferrer(address _add) override public view returns (address) {
      return REFERRER[_add];
    }

    function getReferrerLevel(address _add) override public view returns (uint8) {
      if (REF_BOOST_LEVEL[_add] > 0) return REF_BOOST_LEVEL[_add];
      if (SUMMIT_POINTS == address(0)) return 0;

      (uint256 _selfPoints, uint256 _refPoints) = ISummitPoints(SUMMIT_POINTS).getPoints(_add);

      for (uint8 i = 0; i < LEVEL_REFS_REQ.length; i++) {
        if (_refPoints < LEVEL_REF_POINTS_REQ[i + 1]) return i;
        if (_selfPoints < LEVEL_SELF_POINTS_REQ[i + 1]) return i;
        if (REF_COUNT[_add] < LEVEL_REFS_REQ[i + 1]) return i;
      }

      return uint8(LEVEL_REFS_REQ.length);
    }

    function getRefsCount(address _add) override public view returns (uint256) {
      return REF_COUNT[_add];
    }

    function getReferrerMultiplier(address _add) override public view returns (uint256) {
      return LEVEL_MULT_REWARD[getReferrerLevel(_add)];
    }

    function getAmountWithReferredBonus(address _add, uint256 _amount) override public view returns (uint256) {
      if (REFERRER[_add] == address(0)) return _amount;
      return (_amount * (10000 + BONUS_FOR_BEING_REFERRED)) / 10000;
    }

    function getReferrerAndPoints(address _add, uint256 _amount) override public view returns (address referrer, uint256 points) {
      referrer = REFERRER[_add];
      points = 0;

      if (referrer != address(0)) {
        uint256 mult = getReferrerMultiplier(referrer);
        points = (_amount * mult) / 10000;
      }
    }
}