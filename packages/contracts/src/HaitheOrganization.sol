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
        _orchestrator.usdt().approve(address(_orchestrator), type(uint256).max);
        enabledProducts = new AuxillaryList();
    }

    function balance() external view returns (uint256) {
        return _orchestrator.usdt().balanceOf(address(this));
    }

    function transferCompelledFunds(address to, uint256 amount) external {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than zero");
        require(
            _orchestrator.usdt().balanceOf(address(this)) >= amount,
            "Insufficient balance"
        );
        require(
            msg.sender == address(_orchestrator),
            "Only orchestrator can transfer funds"
        );

        _orchestrator.usdt().transfer(to, amount);
    }

    function enableProduct(address product) external {
        require(msg.sender == owner, "Only owner can enable products");
        require(_orchestrator.isProduct(product), "Product is not registered");

        enabledProducts.add(product);
    }

    function getEnabledProducts() external view returns (address[] memory) {
        return enabledProducts.getAll();
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
