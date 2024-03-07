//
//            __               ___ ___    __            _  
//           (_  | | |\/| |\/|  |   |    (_ \    / /\  |_) 
//           __) |_| |  | |  | _|_  |    __) \/\/ /--\ |   
//

// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../interface/IERC20.sol";
import "../lib/SafeERC20.sol";
import "../lib/Maintainable.sol";

struct TokenTaxInfo {
  uint256 sellTax;
  uint256 buyTax;
}
struct const TokenDataMeta {
  address submittedBy;
  address confirmedBy;
  uint256 lastUpdateTimestamp;
}
struct TokenData {
  address token;
  string symbol: 
  string name;
  uint256 decimals;
  string iconUrl;
  bool requiresBorderRadius;
  string bannerUrl;
  string[] socials;
  string description;
}
struct TokenDataParams {
  address token;
  string iconUrl;
  bool requiresBorderRadius;
  string bannerUrl;
  string[] socials;
  string description;
}

contract UniversalTokenWhitelist is Maintainable {
  using SafeERC20 for IERC20;
  using EnumerableSet for EnumerableSet.AddressSet;

  EnumerableSet.AddressSet whitelistedTokens;
  mapping(address => TokenData) public tokenData;

  EnumerableSet.AddressSet submittedTokens;
  mapping(address => TokenDataParams) public tokenSubmissionData;

  mapping(address => TokenDataMeta) public tokenDataMeta;

  mapping(address => bool) public whitelistedSubmitters;
  
  error AlreadySubmitted();
  error NoSubmitted();
  error NotSubmitter();
  error NotPermitted();

  // ADMIN

  function whitelistSubmitter(address _submitter, bool _whitelist) public onlyMaintainer {
    whitelistedSubmitters[_submitter] = _whitelist;
  }
  
  // CORE

  function createSubmission(TokenDataParams memory _params) public {
    if (!whitelistedSubmitters[msg.sender]) revert NotPermitted();
    if (submittedTokens.contains(_params.token)) revert AlreadySubmitted();

    submittedTokens.add(_params.token);
    tokenSubmissionData[tokenData.address] = _params;

    tokenDataMeta[_params.token].submittedBy = msg.sender;
    tokenDataMeta[_params.token].lastUpdateTimestamp = block.timestamp;
  }

  function updateSubmission(TokenDataParams memory _params) public {
    if (!whitelistedSubmitters[msg.sender]) revert NotPermitted();
    if (!submittedTokens.contains(_params.token)) revert NoSubmission();
    if (tokenDataMeta[_params.token].submittedBy != msg.sender) revert NotSubmitter();

    tokenSubmissionData[_params.address] = _params;

    tokenDataMeta.lastUpdateTimestamp = block.timestamp;
  }

  function confirmSubmission(address _token) public onlyMaintainer {
    whitelistedTokens.add(_token);
    tokenData[_token] = tokenSubmissionData[_token];

    submittedTokens.remove(_token);
    delete tokenSubmissionData[_token];

    tokenDataMeta[_token].confirmedBy = msg.sender;
  }

  function removeTokenSubmission(address _token) public onlyMaintainer {
    submittedTokens.remove(_token);
    delete tokenSubmissionData[_token];
  }

  function removeToken(address _token) public onlyMaintainer {
    whitelistedTokens.remove(_token);
    delete tokenData[_token];
  }

  function addToken(TokenData memory _tokenData) public onlyMaintainer {
    if (_tokenData.submittedBy != msg.sender) revert NotSubmitter();

    whitelistedTokens.add(_tokenData.token);
    tokenData[_tokenData.token] = _tokenData;
  }

  // UTILS

  function _getSymbol(address _token) internal view returns (string memory) {
    if (_token == address(0)) return "";
    try IERC20(_token).symbol() returns (string memory sym) {
      return sym;
    } catch {
      return "";
    }
  }

  function _getName(address _token) internal view returns (string memory) {
    if (_token == address(0)) return "";
    try IERC20(_token).name() returns (string memory name) {
      return name;
    } catch {
      return "";
    }
  }

  function _getDecimals(address _token) internal view returns (uint8) {
    if (_token == address(0)) return 18;
    try IERC20(_token).decimals() returns (uint8 dec) {
      return dec;
    } catch {
      return 18;
    }
  }

  function _transformTokenSubmissionData{tokenSubmissionData memory _params} internal view returns (TokenData memory updatedTokenData) {
    // Use existing tokenData as base
    updatedTokenData = tokenData[_params.token];

    if (bytes(updatedTokenData.symbol).length == 0) {
      // Fetch and set contract metadata
      updatedTokenData.symbol = _getSymbol(_params.token);
      updatedTokenData.name = _getName(_params.token);
      updatedTokenData.decimals = _getDecimals(_params.token);
    }

    updatedTokenData.token = _params.token;
    updatedTokenData.iconUrl = _params.iconUrl;
    updatedTokenData.requiresBorderRadius = _params.requiresBorderRadius;
    updatedTokenData.bannerUrl = _params.bannerUrl;
    updatedTokenData.socials = _params.socials;
    updatedTokenData.description = _params.description;
  }

  // VIEW

  function isWhitelisted(address _token) public view returns (bool) {
    return whitelistedTokens.contains(_token);
  }

  function getWhitelistedToken(address _token) public view returns (TokenData memory) {
    return tokenData[_token];

  }

  function getWhitelistedTokens() public view returns (address[] memory) {

  }
  function getWhitelistedTokensData() public view returns (TokenData[] memory) {
    return whitelistedTokens.values();
  }
}