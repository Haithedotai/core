// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract HaitheCreatorIdentity is ERC721URIStorage {
    address private _orchestrator;
    address private _owner;

    uint256 private _nextTokenId;

    mapping(uint256 => bytes32) public pvtKeySeeds;
    mapping(uint256 => string) public pubKeys;

    function determineNextSeed(address for_) public view returns (bytes32) {
        return bytes32(abi.encodePacked(for_, _nextTokenId));
    }

    constructor(address owner_) ERC721("Haithe Creator Identity", "HaitheCID") {
        _owner = owner_;
        _orchestrator = msg.sender;
    }

    function mint(
        address to_,
        string memory uri_,
        bytes32 pvtKeySeed_,
        string memory pubKey_
    ) external returns (uint256) {
        require(msg.sender == _orchestrator, "Only orchestrator can mint");
        require(
            pvtKeySeed_ == determineNextSeed(to_),
            "Invalid private key seed"
        );

        _nextTokenId++;

        _mint(to_, _nextTokenId);
        _setTokenURI(_nextTokenId, uri_);

        pvtKeySeeds[_nextTokenId] = pvtKeySeed_;
        pubKeys[_nextTokenId] = pubKey_;

        return _nextTokenId;
    }

    // function _transfer(
    //     address from,
    //     address to,
    //     uint256 tokenId,
    //     uint256 batchSize
    // ) internal override {
    //     require(from == address(0), "Token not transferable");
    // }
}
