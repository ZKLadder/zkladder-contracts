# zkladder-contracts
**A collection of smart contract templates deployed through the ZKLadder venture studio**

## Contracts

### Non-Upgradeable
##### ERC721MembershipV1
Token contract implementing the ERC721 standard for NFT's.  

Inherits from:
- [ERC721](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721)
- [ERC721 URI Storage](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721URIStorage)
- [Access Control Enumerable](https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControlEnumerable)
- [EIP712](https://docs.openzeppelin.com/contracts/4.x/api/utils#EIP712)
  

Supports direct minting with the **MINTER_ROLE** or minting with a signed voucher from an account with the **MINTER_ROLE**  
  

*This contract is deprecated and the upgradeable ERC721MembershipV2 should be used instead*


### Upgradeable
*Upgradeable (implementation) contracts are assigned a predetermined address accross all networks which is enforced by deploying them in the same order on every EVM chain*
##### ERC721MembershipV2
Upgradeable token contract implementing the ERC721 standard, with added support for grouping token's into tiers which govern on-chain behavior of minted NFT's.  

Inherits from:
- [Initializeable](https://docs.openzeppelin.com/contracts/4.x/api/proxy#Initializable)
- [UUPS Upgradeable](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable)
- [ERC721 (upgradeable)](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721)
- [ERC721 URI Storage (upgradeable)](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721URIStorage)
- [Access Control Enumerable (upgradeable)](https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControlEnumerable)
- [EIP712 (upgradeable)](https://docs.openzeppelin.com/contracts/4.x/api/utils#EIP712)
  
At least one **Token Tier** must have been created by an account assigned the **DEFAULT_ADMIN_ROLE** before any minting can occur.  
Token tiers enable admins to govern certain on-chain properties of NFT's - such as transferability, mint price, and royalties on secondary sales.  

Supports direct minting with the **MINTER_ROLE** or minting with a signed voucher from an account with the **MINTER_ROLE**  
  
Address: **0x8b6129DA45437810A40DfE8bCd509d7F1a69690b**

##### ERC721Art
Upgradeable token contract implementing the ERC721 standard. Intended to deploy alongside several other *drop contracts* to support flexible minting patterns like auctions, drops, and raffles.

Inherits from:
- [Initializeable](https://docs.openzeppelin.com/contracts/4.x/api/proxy#Initializable)
- [UUPS Upgradeable](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable)
- [ERC721 (upgradeable)](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721)
- [ERC721 URI Storage (upgradeable)](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721URIStorage)
- [ERC721 Royalty (upgradeable)](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721#ERC721Royalty)
- [Access Control Enumerable (upgradeable)](https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControlEnumerable)
- [EIP712 (upgradeable)](https://docs.openzeppelin.com/contracts/4.x/api/utils#EIP712)
  
Supports direct minting with the **MINTER_ROLE**.  
  
Address: **0x20970b7830bCf2166207A73CF4894197946BEEef**

## Building and Deploying
### Building
Because zkladder-contracts is currently a private package hosted on github, there is some extra first-time set up required. 

- Create a [Github Personal Access Token with write access to packages](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- Create an [.npmrc](https://docs.npmjs.com/cli/v8/configuring-npm/npmrc) file with the following content:
```
@zkladder:registry=https://npm.pkg.github.com/zkladder
//npm.pkg.github.com/:_authToken={{YOUR PAT HERE}}
```
- A member of the ZKL development team will assist you in creating a `.env` file.
- Run `npm install`
- Run `npm run build`

### Deploying
This repository includes a deployment script which behaves differently depending on how it is configured, and which contract is being deployed  

##### Deploying a non-upgradeable (legacy) contract
*The only non-upgradeable contract included in this repository is the deprecated ERC721MembershipV1*  

Deploying non-upgradeable contracts can only be done to localhost. Doing so to public networks is not supported and should be done
through the zkladder-sdk

- Run `npm run node` to start a local Ethereum node.
- Run `npx hardhat deploy --network localhost --templateId 1`

##### Deploying an upgradeable contract to localhost  
When deploying any upgradeable contract locally, the deployment script will all of them in order to preserve the assigned contract addresses  

- Run `npm run node` to start a local Ethereum node.
- Run `npx hardhat deploy --network localhost --templateId {templateId} --withproxies {boolean}`

The templateId field refers to the **contractId** of the [contract that you wish to deploy](https://github.com/ZKLadder/zkladder-contracts/blob/main/utils/contracts.js)  

Setting the 'withproxies' flag to 'true' will deploy storage contracts alongside all of the implementation deployments and log out the storage addresses. 

##### Deploying an upgradeable contract to public chains
- Run `npx hardhat deploy --network {network} --templateId {templateId}`

### Manual Testing
[One Click Dapp](https://oneclickdapp.com/) provides a fast way to interact with and manually test any new contract functionality. The application accepts a contract abi and address, and exposes a simple UI which you can use to test contract functions and behavior.

- Add the hardhat local node to metamask (https://support.chainstack.com/hc/en-us/articles/4408642503449-Using-MetaMask-with-a-Hardhat-node)
- Navigate to [One Click Dapp](https://oneclickdapp.com/new)
- Connect to the Dapp with your metamask wallet
- Input any name & description
- Paste in your contract's [ABI](https://github.com/ZKLadder/zkladder-contracts/blob/main/abi.json)
- Paste in your contract's address (logged to console when deploying)
- Leave the network field blank
- Click save and you should now be able to begin interacting with your contract

## Automated Testing
### Linting
- Run `npm run lint`

### Unit Testing
- Run `npm run test`  

*Add **REPORT_GAS=true** to your .env file to generate a full gas usage report*

## Contributing
- Add any new contract source code into the `/contracts` directory
- Add the new contract to the mapping in `/utils/contracts.js`
- Ensure the contracts have been fully tested
- Add new material to the readme if necessary
- Don't forget to `npm run build` which will update the `abi.json` file