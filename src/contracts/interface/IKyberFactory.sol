// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;


interface IKyberFactory {

    /// @notice Fetches the recipient of government fees
    /// and current government fee charged in fee units
    function feeConfiguration() external view returns (address _feeTo, uint24 _governmentFeeUnits);
    function getPool(address, address, uint24) external view returns (address);
}