// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HaitheOrchestrator {
    IERC20 private _usdc;

    constructor(address usdc_) {
        _usdc = IERC20(usdc_);
    }
}
