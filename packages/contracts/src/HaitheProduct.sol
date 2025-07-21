// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./HaitheOrchestrator.sol";

contract HaitheProduct {
    string public cid;
    string public iv;
    string public encryptedKeyForTEE;
    uint256 public pricePerCall;
    address public owner;

    HaitheOrchestrator private _orchestrator;

    constructor(
        string memory name_,
        string memory cid_,
        string memory iv_,
        string memory encryptedKeyForTEE_,
        address owner_,
        uint256 pricePerCall_
    ) {
        _orchestrator = HaitheOrchestrator(msg.sender);

        cid = cid_;
        iv = iv_;
        encryptedKeyForTEE = encryptedKeyForTEE_;
        owner = owner_;
        pricePerCall = pricePerCall_;
    }

    function setPricePerCall(uint256 newPrice) external {
        require(msg.sender == owner, "Only owner can set price");
        pricePerCall = newPrice;
    }
}
