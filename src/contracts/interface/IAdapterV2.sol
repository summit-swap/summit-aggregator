// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAdapterV2 {
    function name() external view returns (string memory);

    function swapGasEstimate() external view returns (uint256);

    function swap(uint256, uint256, address, address, address) external;

    function getTransferTarget(address tokenIn, address tokenOut) external view returns (address);

    function query(uint256, address, address) external view returns (uint256);
}
