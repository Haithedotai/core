// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./HaitheOrchestrator.sol";
import "./AuxillaryList.sol";

contract HaitheOrganization {
    string public name;
    address public owner;
    AuxillaryList public enabledProducts;
    HaitheOrchestrator private _orchestrator;

    constructor(string memory name_, address owner_) {
        name = name_;
        owner = owner_;
        _orchestrator = HaitheOrchestrator(msg.sender);
        enabledProducts = new AuxillaryList();
    }

    function balance() external view returns (uint256) {
        return _orchestrator.usdc().balanceOf(address(this));
    }

    function enableProduct(address product) external {
        require(msg.sender == owner, "Only owner can enable products");
        require(_orchestrator.isProduct(product), "Product is not registered");

        enabledProducts.add(product);
    }

    function disableProduct(address product) external {
        require(msg.sender == owner, "Only owner can disable products");
        require(enabledProducts.contains(product), "Product is not enabled");

        enabledProducts.remove(product);
    }

    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "Only owner can transfer ownership");
        require(newOwner != address(0), "Invalid new owner address");
        require(newOwner != owner, "New owner must be different");

        owner = newOwner;
    }
}
