// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./HaitheOrganization.sol";
import "./HaitheProduct.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./HaitheCreatorIdentity.sol";

contract HaitheOrchestrator {
    IERC20 public usdt;
    address public server;

    HaitheCreatorIdentity public creatorIdentity;
    mapping(address => uint256) public creators;

    mapping(address => bool) public isProduct;
    address[] public products;
    mapping(string => bool) public productNameExists;

    mapping(address => bool) public isOrganization;
    address[] public organizations;
    mapping(string => bool) public organizationNameExists;

    event OrganizationExpenditure(
        address indexed organization,
        uint256 amount,
        address indexed spender
    );

    constructor(address usdt_) {
        server = msg.sender;
        usdt = IERC20(usdt_);
        creatorIdentity = new HaitheCreatorIdentity(server);
    }

    function registerAsCreator(
        address creator_,
        string memory uri_,
        bytes32 pvtKeySeed_,
        string memory pubKey_
    ) external {
        require(msg.sender == server, "Only server can register creators");
        require(creator_ != address(0), "Invalid creator address");
        require(creators[creator_] == 0, "Already registered as creator");
        creators[creator_] = creatorIdentity.mint(
            creator_,
            uri_,
            pvtKeySeed_,
            pubKey_
        );
    }

    function addProduct(
        string memory name_,
        string memory uri_,
        string memory iv_,
        string memory encryptedKeyForTEE_,
        string memory category_,
        uint256 pricePerCall_
    ) external {
        require(
            creators[msg.sender] != 0,
            "Only registered creators can add products"
        );
        require(!productNameExists[name_], "Product name already exists");

        address product = address(
            new HaitheProduct(
                name_,
                uri_,
                iv_,
                encryptedKeyForTEE_,
                msg.sender,
                category_,
                pricePerCall_
            )
        );
        products.push(product);
        isProduct[product] = true;
        productNameExists[name_] = true;
    }

    function createOrganization(string memory name_) external {
        require(
            !organizationNameExists[name_],
            "Organization name already exists"
        );

        HaitheOrganization org = new HaitheOrganization(name_, msg.sender);

        isOrganization[address(org)] = true;
        organizations.push(address(org));
        organizationNameExists[name_] = true;
    }

    function organizationsCount() external view returns (uint256) {
        return organizations.length;
    }

    function productsCount() external view returns (uint256) {
        return products.length;
    }

    function getOrganizationIndex(
        address orgAddress
    ) external view returns (uint256) {
        require(isOrganization[orgAddress], "Not a registered organization");
        for (uint256 i = 0; i < products.length; i++) {
            if (products[i] == orgAddress) {
                return i;
            }
        }
        revert("Organization not found");
    }

    function collectPaymentForCall(
        address orgAddress_,
        uint256 creatorId_,
        address spender_,
        uint256 amount_
    ) external {
        require(isOrganization[orgAddress_], "Not a registered organization");
        require(amount_ > 0, "Invalid amount");

        creatorIdentity.registerFunds(creatorId_, amount_);
        usdt.transferFrom(orgAddress_, address(creatorIdentity), amount_);

        emit OrganizationExpenditure(orgAddress_, amount_, spender_);
    }

    function collectPaymentForLLMCall(
        address orgAddress_,
        address spender_,
        uint256 amount_
    ) external {
        require(isOrganization[orgAddress_], "Not a registered organization");
        require(amount_ > 0, "Invalid amount");

        usdt.transferFrom(orgAddress_, address(this), amount_);

        emit OrganizationExpenditure(orgAddress_, amount_, spender_);
    }
}
