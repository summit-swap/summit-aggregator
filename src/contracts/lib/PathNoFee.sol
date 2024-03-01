// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./BytesLib.sol";
import "./FullMath.sol";

library PathNoFee {
    using BytesLib for bytes;

    uint256 constant ADDR_SIZE = 20;
    uint256 constant MULTIPLE_POOLS_MIN_LENGTH = 3*ADDR_SIZE;

    function decodeFirstPool(
        bytes memory path
    ) pure internal returns (address, address) {
        return (path.toAddress(0), path.toAddress(ADDR_SIZE));
    }

    function hasMultiplePools(
        bytes memory path
    ) internal pure returns (bool) {
        return path.length >= MULTIPLE_POOLS_MIN_LENGTH;
    }

    function skipToken(bytes memory path) internal pure returns (bytes memory) {
        return path.slice(ADDR_SIZE, path.length - ADDR_SIZE);
    }

}

