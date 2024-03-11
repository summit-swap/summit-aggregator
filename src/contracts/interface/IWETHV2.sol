// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IWETHV2 is IERC20 {
    function withdraw(uint256 amount) external;
    function deposit() external payable;
}
