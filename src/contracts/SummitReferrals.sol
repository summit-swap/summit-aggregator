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

contract SummitReferrals is Maintainable, ISummitReferrals {
    using SafeMath for uint256;

    uint256[] public LevelPoints = [0, 100e18, 10000e18, 250000e18, 1000000e18];
    uint256[] public LevelMult = [0, 100, 200, 300, 400];
    uint256 public HasReferrerBonusMult = 200;
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

    function setLevelData(uint256[] memory _points, uint256[] memory _mult, uint256 _hasReferrerBonusMult) override public onlyMaintainer {
      if (_points.length != _mult.length) revert LengthMismatch();
      LevelPoints = _points;
      LevelMult = _mult;
      HasReferrerBonusMult = _hasReferrerBonusMult;
      emit UpdatedLevelData(_points, _mult, _hasReferrerBonusMult);
    }



    function getReferrer(address _add) override public view returns (address) {
      return referrerOf[_add];
    }  

    function getReferrerLevel(uint256 _points) override public view returns (uint8) {
      for (uint8 i = 0; i < LevelPoints.length - 1; i++) {
        if (_points < LevelPoints[i + 1]) return i;
      }
      return uint8(LevelPoints.length);
    }

    function getReferrerMultiplier(uint256 _points) override public view returns (uint256) {
      return LevelMult[getReferrerLevel(_points)];
    }
}