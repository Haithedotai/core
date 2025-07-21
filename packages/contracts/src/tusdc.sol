// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract tusdc is ERC20 {
    constructor() ERC20("testUSDC", "tUSDC") {
        _mint(msg.sender, 100_000_000 * 10 ** decimals());
    }
}
