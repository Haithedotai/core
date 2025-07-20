// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./HaitheOrchestrator.sol";

contract HaitheDataProviderIdentity {
    string name;
    HaitheOrchestrator private _orchestrator;

    constructor(string memory _name) {
        name = _name;
        _orchestrator = HaitheOrchestrator(msg.sender);
    }

    function balance() {}
}
