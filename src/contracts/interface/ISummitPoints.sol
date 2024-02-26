//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

interface ISummitPoints {
  event UpdatedVolumeAdapter(address indexed _volumeAdapter);
  event UpdatedReferralsContract(address indexed _referrals);
  event UpdatedGlobalBoost(uint256 _boost);
  event UpdatedVolumeScalers(uint256 _refVolumeScaler, uint256 _adapterVolumeScaler);
  event AddedUserVolume(address indexed _user, uint256 _volume);
  event AddedReferrerVolume(address indexed _referrer, address indexed _user, uint256 _volume);
  event AddedAdapterVolume(address indexed _adapter, uint256 _volume);
  event TransferredVolume(address indexed _caller, address indexed _from, address indexed _to, uint256 _selfVolume, uint256 _refVolume, uint256 _adapterVolume);
  event UpdatedDelegate(address indexed _caller, address indexed _user, address indexed _delegate);
  event UpdatedAdapterDelegate(address indexed _adapter, address indexed _delegate);
  event SummitTeamGivenPoints(address indexed _user, uint256 _volume);

  function setVolumeAdapter(address _volumeAdapter) external;
  function setReferralsContract(address _referrals) external;
  function setGlobalBoost(uint256 _boost) external;
  function summitTeamGivePoints(address _add, uint256 _volume) external;
  function setVolumeScalers(uint256 _refVolumeScaler, uint256 _adapterVolumeScaler) external;
  function setDelegate(address _user, address _delegate) external;
  function setAdapterDelegate(address _adapter, address _delegate) external;
  function addVolume(address _add, uint256 _volume) external;
  function addAdapterVolume(address _adapter, uint256 _volume) external;
  function transferVolume(address _from, address _to, uint256 _selfVolume, uint256 _refVolume, uint256 _adapterVolume) external;
  function getVolume(address _add) external view returns (uint256 selfVolume, uint256 refVolume, uint256 adapterVolume);
  function getPoints(address _add) external view returns (uint256 pointsFromSelf, uint256 pointsFromRef, uint256 pointsFromAdapter, uint256 pointsTotal);
}
