// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

interface IAlgebraFactory {
    function poolByPair(address, address) external view returns (address);
}