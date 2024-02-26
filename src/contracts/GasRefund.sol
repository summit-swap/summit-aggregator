// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IBlast} from "./interface/IBlast.sol";
import {IGasRefund} from "./interface/IGasRefund.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "./lib/MessageHashUtils.sol";

contract GasRefund is IGasRefund, Ownable {
    address public signer;
    IBlast public constant blast =
        IBlast(0x4300000000000000000000000000000000000002);

    mapping(address => uint256) public nonces;

    constructor(address _signer) Ownable() {
        signer = _signer;
    }

    function changeSigner(address _signer) override external onlyOwner {
        signer = _signer;
    }

    function configureGovernor(address _governor) override external onlyOwner {
        blast.configureGovernor(_governor);
    }

    function claimAllGas(
        address[] calldata _contractAddresses
    ) override external onlyOwner {
        for (uint i = 0; i < _contractAddresses.length; i++) {
            blast.claimAllGas(_contractAddresses[i], address(this));
        }
    }

    function claimGasAtMinClaimRate(
        address[] calldata _contractAddresses,
        uint256[] calldata _minClaimRateBips
    ) override external onlyOwner {
        require(
            _contractAddresses.length == _minClaimRateBips.length,
            "GasRefund: should have the same length"
        );
        for (uint i = 0; i < _contractAddresses.length; i++) {
            blast.claimMaxGas(_contractAddresses[i], address(this));
        }
    }

    function claimMaxGas(
        address[] calldata _contractAddresses
    ) override external onlyOwner {
        for (uint i = 0; i < _contractAddresses.length; i++) {
            blast.claimMaxGas(_contractAddresses[i], address(this));
        }
    }

    function claimGas(
        address[] calldata _contractAddresses,
        uint256[] calldata _gasToClaim,
        uint256[] calldata _gasSecondsToConsume
    ) override external onlyOwner {
        for (uint i = 0; i < _contractAddresses.length; i++) {
            blast.claimGas(
                _contractAddresses[i],
                address(this),
                _gasToClaim[i],
                _gasSecondsToConsume[i]
            );
        }
    }

    function readGasParams(
        address contractAddress
    )
        external
        view
        returns (
            uint256 etherSeconds,
            uint256 etherBalance,
            uint256 lastUpdated,
            IBlast.GasMode
        )
    {
        return blast.readGasParams(contractAddress);
    }

    // TODO: eip712 signatures
    function withdrawGas(
        Withdrawal calldata _withdrawal,
        bytes memory _sig
    ) override external payable {
        require(
            _verify(
                keccak256(
                    abi.encodePacked(
                        msg.sender,
                        _withdrawal.amount,
                        _withdrawal.nonce
                    )
                ),
                _sig
            ),
            "GasRefund: invalid signature"
        );
        require(
            nonces[msg.sender] == _withdrawal.nonce,
            "GasRefund: invalid nonce"
        );

        (bool success, ) = address(msg.sender).call{value: _withdrawal.amount}(
            ""
        );
        require(success, "GasRefund: transfer failed");

        nonces[msg.sender]++;
        emit Withdrawn(msg.sender, _withdrawal.amount);
    }

    function _verify(
        bytes32 _data,
        bytes memory _signature
    ) internal view returns (bool) {
        return
            ECDSA.recover(
                MessageHashUtils.toEthSignedMessageHash(_data),
                _signature
            ) == signer;
    }
}