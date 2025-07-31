// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract tUSDT is ERC20 {
    constructor() ERC20("testUSDT", "tUSDT") {
        _mint(msg.sender, 100_000_000 * 10 ** decimals());
    }
}
