// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGasRefund {
    struct Withdrawal {
        address recipient;
        uint256 amount;
        uint256 nonce;
    }

    event Withdrawn(address indexed recipient, uint256 amount);

    function changeSigner(address _signer) external;

    function withdrawGas(
        Withdrawal calldata _withdrawal,
        bytes memory _sig
    ) external payable;

    function configureGovernor(address _governor) external;

    function claimAllGas(address[] calldata _contractAddresses) external;

    function claimGasAtMinClaimRate(
        address[] calldata _contractAddresses,
        uint256[] calldata _minClaimRateBips
    ) external;

    function claimMaxGas(address[] calldata _contractAddresses) external;

    function claimGas(
        address[] calldata _contractAddresses,
        uint256[] calldata _gasToClaim,
        uint256[] calldata _gasSecondsToConsume
    ) external;
}