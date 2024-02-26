// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @dev Contract module which extends the basic access control mechanism of Ownable
 * to include many maintainers, whom only the owner (DEFAULT_ADMIN_ROLE) may add and
 * remove.
 *
 * By default, the owner account will be the one that deploys the contract. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available this modifier:
 * `onlyMaintainer`, which can be applied to your functions to restrict their use to
 * the accounts with the role of maintainer.
 */

abstract contract Maintainable is AccessControl {
    bytes32 public constant MAINTAINER_ROLE = keccak256("MAINTAINER_ROLE");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MAINTAINER_ROLE, msg.sender);
    }

    function addMaintainer(address addedMaintainer) public virtual {
        grantRole(MAINTAINER_ROLE, addedMaintainer);
    }

    function removeMaintainer(address removedMaintainer) public virtual {
        revokeRole(MAINTAINER_ROLE, removedMaintainer);
    }

    function renounceRole(bytes32 role) public virtual {
        renounceRole(role, msg.sender);
    }

    function transferOwnership(address newOwner) public virtual {
        grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyMaintainer() {
        require(hasRole(MAINTAINER_ROLE, msg.sender), "Maintainable: Caller is not a maintainer");
        _;
    }
}
