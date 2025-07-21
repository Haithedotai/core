// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract HaitheCreatorIdentity is ERC721 {
    address private _orchestrator;
    address private _owner;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => string) public keySeeds;

    constructor(address owner_) ERC721("Haithe Creator Identity", "HaitheCID") {
        _owner = owner_;
    }

    function mint(address to_, uint256 uri_) external {
        require(msg.sender == _orchestrator, "Only orchestrator can mint");

        _tokenIds.increment();

        _mint(to_, _tokenIds.current());
        _setTokenURI(_tokenIds.current(), uri_);

        return _tokenIds.current();
    }
}
