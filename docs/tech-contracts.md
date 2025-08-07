# Haithe Platform - Smart Contracts Technical Guide

## Overview

The Haithe platform's smart contract architecture implements a decentralized AI marketplace ecosystem with the following core components:

- **HaitheOrchestrator**: Central coordination contract managing the entire platform
- **HaitheOrganization**: Multi-tenant workspace management with financial controls
- **HaitheProduct**: Marketplace product representation with creator attribution
- **HaitheCreatorIdentity**: NFT-based creator identity and revenue management
- **AuxillaryList**: Utility contract for managing dynamic address lists
- **SignatureVerifier**: Cryptographic signature validation utilities
- **tUSDT**: Test USDT token for development and testing

## Contract Architecture

### Core Dependencies
- **OpenZeppelin Contracts v5.4.0**: Standard ERC20, ERC721, and access control implementations
- **Solidity v0.8.28**: Modern Solidity with built-in overflow protection
- **Viem v2.7.6**: TypeScript blockchain interaction library

### Network Support
- **Hardhat Network**: Local development and testing
- **Hyperion Testnet**: Metis testnet for staging deployments
- **Production**: Configurable for mainnet deployments

## Contract Specifications

### 1. HaitheOrchestrator

**Purpose**: Central coordination contract that manages the entire platform ecosystem.

**Key State Variables**:
- `usdt`: ERC20 token contract for payments
- `server`: Authorized server address for administrative functions
- `creatorIdentity`: NFT contract for creator identities
- `creators`: Mapping of creator addresses to their NFT token IDs
- `isProduct`: Boolean mapping for registered product addresses
- `products`: Array of all registered product addresses
- `productNameExists`: Boolean mapping for unique product names
- `isOrganization`: Boolean mapping for registered organization addresses
- `organizations`: Array of all registered organization addresses
- `organizationNameExists`: Boolean mapping for unique organization names

**Core Functions**:

#### Creator Management
```solidity
function registerAsCreator(
    address creator_,
    string memory uri_,
    bytes32 pvtKeySeed_,
    string memory pubKey_
) external
```
- **Access Control**: Only server can call
- **Logic**: Mints NFT identity for creator with metadata
- **Validation**: Ensures creator not already registered and address is valid

#### Product Management
```solidity
function addProduct(
    string memory name_,
    string memory uri_,
    string memory iv_,
    string memory encryptedKeyForTEE_,
    string memory category_,
    uint256 pricePerCall_
) external
```
- **Access Control**: Only registered creators can call
- **Logic**: Deploys new HaitheProduct contract and registers it
- **Validation**: Ensures unique product name and creator is registered

#### Organization Management
```solidity
function createOrganization(string memory name_) external
```
- **Access Control**: Any address can call
- **Logic**: Deploys new HaitheOrganization contract
- **Validation**: Ensures unique organization name

#### Payment Processing
```solidity
function collectPaymentForCall(
    address orgAddress_,
    uint256 creatorId_,
    address spender_,
    uint256 amount_
) external

function collectPaymentForLLMCall(
    address orgAddress_,
    address spender_,
    uint256 amount_
) external
```
- **Access Control**: Only server can call
- **Logic**: Transfers USDT from organization to creator/platform
- **Validation**: Ensures organization is registered and amount is positive

### 2. HaitheOrganization

**Purpose**: Multi-tenant workspace with financial management and product access control.

**Key State Variables**:
- `name`: Organization name
- `owner`: Organization owner address
- `enabledProducts`: AuxillaryList contract managing enabled products
- `_orchestrator`: Reference to main orchestrator contract

**Core Functions**:

#### Financial Management
```solidity
function balance() external view returns (uint256)
```
- **Logic**: Returns USDT balance of organization

```solidity
function transferCompelledFunds(address to, uint256 amount) external
```
- **Access Control**: Only orchestrator can call
- **Logic**: Transfers USDT to specified address
- **Validation**: Ensures sufficient balance and valid recipient

#### Product Management
```solidity
function enableProduct(address product) external
function disableProduct(address product) external
function getEnabledProducts() external view returns (address[] memory)
```
- **Access Control**: Only owner can enable/disable products
- **Logic**: Manages product access through AuxillaryList
- **Validation**: Ensures product is registered in orchestrator

#### Ownership Management
```solidity
function transferOwnership(address newOwner) external
```
- **Access Control**: Only current owner can call
- **Logic**: Transfers organization ownership
- **Validation**: Ensures new owner is valid and different

### 3. HaitheProduct

**Purpose**: Represents marketplace products with creator attribution and pricing.

**Key State Variables**:
- `name`: Product name
- `uri`: Metadata URI
- `iv`: Initialization vector for encryption
- `encryptedKeyForTEE`: Encrypted key for Trusted Execution Environment
- `pricePerCall`: Price in USDT per product call
- `creator`: Creator address
- `category`: Product category
- `_orchestrator`: Reference to main orchestrator contract

**Core Functions**:

#### Product Configuration
```solidity
function setPricePerCall(uint256 newPrice) external
```
- **Access Control**: Only creator can call
- **Logic**: Updates product pricing
- **Validation**: None beyond access control

### 4. HaitheCreatorIdentity

**Purpose**: NFT-based creator identity with revenue tracking and withdrawal capabilities.

**Inheritance**: ERC721URIStorage from OpenZeppelin

**Key State Variables**:
- `_orchestrator`: Reference to orchestrator contract
- `_owner`: Contract owner address
- `_nextTokenId`: Auto-incrementing token ID
- `pvtKeySeeds`: Mapping of token IDs to private key seeds
- `pubKeys`: Mapping of token IDs to public keys
- `funds`: Mapping of token IDs to accumulated funds

**Core Functions**:

#### Identity Management
```solidity
function mint(
    address to_,
    string memory uri_,
    bytes32 pvtKeySeed_,
    string memory pubKey_
) external returns (uint256)
```
- **Access Control**: Only orchestrator can call
- **Logic**: Mints new creator identity NFT
- **Validation**: Ensures correct private key seed

#### Revenue Management
```solidity
function registerFunds(uint256 tokenId_, uint256 amount_) external
function withdrawFunds(uint256 tokenId_) external
```
- **Access Control**: Only orchestrator can register, only NFT owner can withdraw
- **Logic**: Tracks and allows withdrawal of creator revenue
- **Validation**: Ensures funds exist before withdrawal

### 5. AuxillaryList

**Purpose**: Utility contract for managing dynamic lists of addresses with efficient add/remove operations.

**Inheritance**: Ownable from OpenZeppelin

**Key State Variables**:
- `_values`: Array of stored addresses
- `_valueIndexes`: Mapping of addresses to their array indices
- `_valueExists`: Boolean mapping for address existence

**Core Functions**:

#### List Management
```solidity
function add(address value_) public onlyOwner
function remove(address value_) public onlyOwner
function safeAdd(address value_) external onlyOwner
function safeRemove(address value_) external onlyOwner
```
- **Access Control**: Only owner can modify list
- **Logic**: Efficient O(1) add/remove operations using index mapping
- **Validation**: Safe versions throw errors for invalid operations

#### Query Functions
```solidity
function contains(address value_) external view returns (bool)
function indexOf(address value_) external view returns (uint256)
function length() external view returns (uint256)
function getAll() external view returns (address[] memory)
```
- **Logic**: Various query operations for list state
- **Performance**: O(1) lookups using mappings

### 6. SignatureVerifier

**Purpose**: Cryptographic signature validation utilities for secure off-chain message verification.

**Core Functions**:

#### Signature Verification
```solidity
function verifySignature(
    address signer_,
    bytes32 messageHash_,
    bytes calldata signature_
) public pure returns (bool)

function recoverSigner(
    bytes32 messageHash_,
    bytes calldata signature_
) private pure returns (address)
```
- **Logic**: Ethereum signature recovery and verification
- **Security**: Uses standard Ethereum signature format
- **Validation**: Ensures 65-byte signature length

### 7. tUSDT

**Purpose**: Test USDT token for development and testing environments.

**Inheritance**: ERC20 from OpenZeppelin

**Key Features**:
- **Initial Supply**: 100,000,000 tokens minted to deployer
- **Decimals**: 6 (standard USDT decimals)
- **Symbol**: "tUSDT"
- **Name**: "testUSDT"

## Deployment Architecture

### Deployment Order
1. **tUSDT**: Deployed first as payment token
2. **HaitheOrchestrator**: Deployed with tUSDT address parameter
3. **HaitheCreatorIdentity**: Auto-deployed by orchestrator constructor
4. **HaitheOrganization**: Deployed on-demand by users
5. **HaitheProduct**: Deployed on-demand by creators

### Configuration Files
- **definitions.json**: Contract addresses and ABIs for backend services
- **definitions.ts**: TypeScript definitions for frontend integration

## Security Considerations

### Access Control
- **Server-Only Functions**: Critical operations restricted to authorized server
- **Owner-Only Functions**: Organization and product management restricted to owners
- **Creator-Only Functions**: Product pricing restricted to creators

### Financial Security
- **USDT Approvals**: Organizations pre-approve orchestrator for unlimited transfers
- **Fund Tracking**: Creator revenue tracked per NFT token ID
- **Withdrawal Controls**: Only NFT owners can withdraw accumulated funds

### Data Integrity
- **Unique Names**: Product and organization names must be unique
- **Valid Addresses**: All address parameters validated for non-zero values
- **Positive Amounts**: All financial amounts must be greater than zero

### Cryptographic Security
- **Signature Verification**: Standard Ethereum signature recovery
- **Private Key Seeds**: Deterministic seed generation for creator identities
- **Encryption Support**: IV and encrypted key storage for TEE integration

## Gas Optimization

### Efficient Data Structures
- **Mapping Usage**: O(1) lookups for existence checks
- **Index Tracking**: Efficient array element removal using index mapping
- **Batch Operations**: Support for bulk product/organization queries

### Storage Optimization
- **Packed Structs**: Efficient storage layout for multiple variables
- **Minimal State**: Only essential data stored on-chain
- **External Storage**: Metadata stored off-chain via URIs

## Integration Points

### Backend Services
- **Contract Addresses**: Exported via definitions.json
- **Event Monitoring**: OrganizationExpenditure events for financial tracking
- **State Queries**: View functions for current platform state

### Frontend Integration
- **TypeScript Definitions**: Exported via definitions.ts
- **ABI Access**: All contract ABIs available for frontend calls
- **Event Handling**: Real-time updates via blockchain events

### External Systems
- **USDT Integration**: Standard ERC20 token interface
- **NFT Standards**: ERC721 compliance for creator identities
- **Signature Verification**: Standard Ethereum signature format

## Testing Strategy

### Unit Testing
- **Contract Functions**: Individual function behavior validation
- **Access Control**: Permission verification for all restricted functions
- **State Changes**: Verification of contract state modifications

### Integration Testing
- **Contract Interactions**: Cross-contract function calls
- **Event Emission**: Verification of expected events
- **Gas Usage**: Performance testing for all operations

### Security Testing
- **Access Control**: Unauthorized access attempt validation
- **Reentrancy**: Protection against reentrancy attacks
- **Overflow Protection**: Solidity 0.8.x built-in protection validation

## Monitoring and Analytics

### Key Metrics
- **Organization Count**: Total registered organizations
- **Product Count**: Total registered products
- **Creator Count**: Total registered creators
- **Transaction Volume**: USDT transfer amounts and frequency

### Event Tracking
- **OrganizationExpenditure**: Financial transaction monitoring
- **NFT Minting**: Creator registration tracking
- **Product Creation**: Marketplace growth monitoring

### Health Checks
- **Contract Balances**: USDT balance monitoring
- **Active Products**: Enabled product tracking
- **Creator Revenue**: Fund accumulation monitoring

This technical guide provides a comprehensive overview of the Haithe platform's smart contract architecture, focusing on the logical structure and functionality without being tied to specific programming languages or frameworks. 