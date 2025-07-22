// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./HaitheOrchestrator.sol";

contract HaitheProduct {
    string public name;
    string public cid;
    string public iv;
    string public encryptedKeyForTEE;
    uint256 public pricePerCall;
    address public creator;

    HaitheOrchestrator private _orchestrator;

    constructor(
        string memory name_,
        string memory cid_,
        string memory iv_,
        string memory encryptedKeyForTEE_,
        address creator_,
        uint256 pricePerCall_
    ) {
        _orchestrator = HaitheOrchestrator(msg.sender);

        name = name_;
        require(bytes(name).length > 0, "Product name cannot be empty");

        cid = cid_;
        iv = iv_;
        encryptedKeyForTEE = encryptedKeyForTEE_;
        creator = creator_;
        pricePerCall = pricePerCall_;
    }

    function setPricePerCall(uint256 newPrice) external {
        require(msg.sender == creator, "Only creator can set price");
        pricePerCall = newPrice;
    }
}
