//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./interface/ISummitPoints.sol";
import "./interface/ISummitReferrals.sol";
import "./interface/IBlast.sol";
import "./lib/Maintainable.sol";
import "./lib/SummitViewUtils.sol";
import "./lib/Recoverable.sol";


contract SummitPoints is Maintainable, Recoverable, ISummitPoints {

  address public VOLUME_ADAPTER;
  address public REFERRALS;
  mapping(address => uint256) public SELF_VOLUME;
  mapping(address => uint256) public REF_VOLUME;
  mapping(address => uint256) public ADAPTER_VOLUME;
  mapping(address => address) public DELEGATE;
  mapping(address => bool) public BLACKLISTED;

  uint256 public GLOBAL_BOOST = 0;
  uint256 public BASE_VOLUME_SCALER = 100; // 1% (1 point per $100 in volume initially)
  uint256 public REF_VOLUME_SCALER = 500; // 5% - 15% based on bonus multiplier from referrals
  uint256 public ADAPTER_VOLUME_SCALER = 200; // 2%

  error AlreadyInitialized();
  error ZeroAddress();
  error NotPermitted();
  error InvalidSelfAmount();
  error InvalidRefAmount();
  error InvalidAdapterAmount();

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

  function setVolumeAdapter(address _volumeAdapter) override public onlyMaintainer {
    emit UpdatedVolumeAdapter(_volumeAdapter);
    VOLUME_ADAPTER = _volumeAdapter;
  }

  function setReferralsContract(address _referrals) override public onlyMaintainer {
    emit UpdatedReferralsContract(_referrals);
    REFERRALS = _referrals;
  }

  function setVolumeScalers(uint256 _refVolumeScaler, uint256 _adapterVolumeScaler) override public onlyMaintainer {
    REF_VOLUME_SCALER = _refVolumeScaler;
    ADAPTER_VOLUME_SCALER = _adapterVolumeScaler;
    emit UpdatedVolumeScalers(_refVolumeScaler, _adapterVolumeScaler);
  }

  function setAdapterDelegate(address _adapter, address _delegate) override public onlyMaintainer {
    DELEGATE[_adapter] = _delegate;
    emit UpdatedAdapterDelegate(_adapter, _delegate);
  }

  function setGlobalBoost(uint256 _boost) override public onlyMaintainer {
    GLOBAL_BOOST = _boost;
    emit UpdatedGlobalBoost(_boost);
  }

  function setBlacklisted(address _add, bool _blacklisted) override public onlyMaintainer {
    BLACKLISTED[_add] = _blacklisted;
    emit UpdatedBlacklisted(_add, _blacklisted);
  }

  function setDelegate(address _user, address _delegate) override public {
    if (_user != msg.sender && DELEGATE[_user] != msg.sender) revert NotPermitted();
    DELEGATE[msg.sender] = _delegate;
    emit UpdatedDelegate(msg.sender, _user, _delegate);
  }

  function summitTeamGivePoints(address _add, uint256 _volume) override public onlyMaintainer {
    SELF_VOLUME[_add] += _volume;
    emit SummitTeamGivenPoints(_add, _volume);    
  }

  function addVolume(address _add, uint256 _volume) override public {
    if (msg.sender != VOLUME_ADAPTER) revert NotPermitted();

    if (GLOBAL_BOOST > 0) {
      _volume = (_volume * (10000 + GLOBAL_BOOST)) / 10000;
    }

    SELF_VOLUME[_add] += _volume;
    emit AddedUserVolume(_add, _volume);

    address referrer = REFERRALS == address(0) ? address(0) : ISummitReferrals(REFERRALS).getReferrer(_add);
    if (referrer != address(0)) {
      REF_VOLUME[referrer] += _volume;
      emit AddedReferrerVolume(referrer, _add, _volume);
    }
  }

  function addAdapterVolume(address _adapter, uint256 _volume) override public {
    if (msg.sender != VOLUME_ADAPTER) revert NotPermitted();

    if (GLOBAL_BOOST > 0) {
      _volume = (_volume * (10000 + GLOBAL_BOOST)) / 10000;
    }

    ADAPTER_VOLUME[_adapter] += _volume;
    emit AddedAdapterVolume(_adapter, _volume);
  }

  function transferVolume(address _from, address _to, uint256 _selfAmount, uint256 _refAmount, uint256 _adapterAmount) override public {
    if (_to == address(0)) revert ZeroAddress();
    if (_from != msg.sender && DELEGATE[_from] != msg.sender) revert NotPermitted();
    if (_selfAmount > SELF_VOLUME[_from]) revert InvalidSelfAmount();
    if (_refAmount > REF_VOLUME[_from]) revert InvalidRefAmount();
    if (_adapterAmount > ADAPTER_VOLUME[_from]) revert InvalidAdapterAmount();
    
    SELF_VOLUME[_from] -= _selfAmount;
    SELF_VOLUME[_to] += _selfAmount;
    
    REF_VOLUME[_from] -= _refAmount;
    REF_VOLUME[_to] += _refAmount;

    ADAPTER_VOLUME[_from] -= _adapterAmount;
    ADAPTER_VOLUME[_to] += _adapterAmount;

    emit TransferredVolume(msg.sender, _from, _to, _selfAmount, _refAmount, _adapterAmount);
  }

  function getVolume(address _add) override public view returns (uint256 selfVolume, uint256 refVolume, uint256 adapterVolume) {
    return (
      SELF_VOLUME[_add],
      REF_VOLUME[_add],
      ADAPTER_VOLUME[_add]
    );
  }

  function getPoints(address _add) override public view returns (uint256 pointsFromSelf, uint256 pointsFromRef, uint256 pointsFromAdapter, uint256 pointsTotal) {
    if (BLACKLISTED[_add]) return (0, 0, 0, 0);
    uint256 userSelfVolMult = REFERRALS == address(0) ? 10000 : ISummitReferrals(REFERRALS).getSelfVolumeMultiplier(_add);
    uint256 userRefVolMult = REFERRALS == address(0) ? 0 : ISummitReferrals(REFERRALS).getRefVolumeBonusMultiplier(_add);
    pointsFromSelf = (SELF_VOLUME[_add] * userSelfVolMult * BASE_VOLUME_SCALER) / (10000 * 10000);
    pointsFromRef = (REF_VOLUME[_add] * (REF_VOLUME_SCALER + userRefVolMult) * BASE_VOLUME_SCALER) / (10000 * 10000);
    pointsFromAdapter = (ADAPTER_VOLUME[_add] * ADAPTER_VOLUME_SCALER * BASE_VOLUME_SCALER) / (10000 * 10000);
    pointsTotal = pointsFromSelf + pointsFromRef + pointsFromAdapter;
  }
}