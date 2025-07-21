// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./AuxillaryList.sol";
import "./HaitheProduct.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./HaitheCreatorIdentity.sol";

contract HaitheOrchestrator {
    IERC20 public usdc;
    address public server;
    
    HaitheCreatorIdentity public creatorIdentity;
    mapping(address => uint256) public creators;

    mapping(address => bool) public isProduct;
    address[] public products;

    constructor(address usdc_) {
        server = msg.sender;
        usdc = IERC20(usdc_);
        creatorIdentity = new HaitheCreatorIdentity(server);
    }

    function registerAsCreator(address creator_, string memory uri_) external  {
        require(msg.sender == server, "Only server can register creators");
        require(creator_ != address(0), "Invalid creator address");
        require(creators[creator_] == 0, "Already registered as creator");
        creators[creator_] = creatorIdentity.mint(creator_, uri_);
    }

    function addProduct(
        name_ string memory,
        cid_ string memory,
        iv_ string memory,
        encryptedKeyForTEE_ string memory,
        pricePerCall_ uint256
    ) external {
        require(creators[msg.sender] != 0, "Only registered creators can add products");
            address product = address(new HaitheProduct(
                name_,
                cid_,
                iv_,
                encryptedKeyForTEE_,
                msg.sender,
                pricePerCall_
            ));
        products.push(product);
        isProduct[product] = true;
    }
}
