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

    // Level requirements
    uint256[] public LEVEL_REF_POINTS_REQ = [0, 0, 10000e18, 25000e18, 100000e18, 1000000e18];
    uint256[] public LEVEL_SELF_POINTS_REQ = [0, 100e18, 1000e18, 2000e18, 5000e18, 25000e18];
    uint256[] public LEVEL_REFS_REQ = [0, 0, 3, 5, 10, 25];

    uint256[] public LEVEL_MULT_REWARD = [0, 0, 400, 500, 700, 1500];

    uint256 public HasReferrerBonusMult = 400;
    mapping(address => address) public referrerOf;

    error SelfReferral();
    error ReciprocalReferral();
    error LengthMismatch();

    function setReferrer(address _referrer) override public {
        if(_referrer == msg.sender) revert SelfReferral();
        if(referrerOf[_referrer] == msg.sender) revert ReciprocalReferral();
        if(referrerOf[referrerOf[_referrer]] == msg.sender) revert ReciprocalReferral();
        referrerOf[msg.sender] = _referrer;
        emit UpdatedReferrer(msg.sender, _referrer);
    }

    function setLevelData(uint256[] memory _refPointsReq, uint256[] memory _selfPointsReq, uint256[] memory _refsReq, uint256[] memory _multRew, uint256 _hasReferrerBonusMult) override public onlyMaintainer {
      if (_refPointsReq.length != _selfPointsReq.length || _refPointsReq.length != _refsReq.length || _refPointsReq.length != _multRew.length) revert LengthMismatch();
      LEVEL_REF_POINTS_REQ = _refPointsReq;
      LEVEL_SELF_POINTS_REQ = _selfPointsReq;
      LEVEL_REFS_REQ = _refsReq;
      LEVEL_MULT_REWARD = _multRew;
      HasReferrerBonusMult = _hasReferrerBonusMult;
      emit UpdatedLevelData(_refPointsReq, _selfPointsReq, _refsReq, _multRew, _hasReferrerBonusMult);
    }

    function getReferrer(address _add) override public view returns (address) {
      return referrerOf[_add];
    }  

    function getReferrerLevel(uint256 _points) override public view returns (uint8) {
      for (uint8 i = 0; i < LEVEL_REF_POINTS_REQ.length - 1; i++) {
        if (_points < LEVEL_REF_POINTS_REQ[i + 1]) return i;
      }
      return uint8(LEVEL_REF_POINTS_REQ.length);
    }

    function getReferrerMultiplier(uint256 _points) override public view returns (uint256) {
      return LEVEL_MULT_REWARD[getReferrerLevel(_points)];
    }
}