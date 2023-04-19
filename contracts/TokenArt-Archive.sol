// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
  @title Token Art 2023 Gift Collection
  @author Token Art x ZKLadder
 */
contract TokenArt2023Archive is ERC721, AccessControl {
    // Collection level metadata
    string public contractURI;

    // baseURI for all tokenURI's
    string private baseURI;

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _totalSupply;

    uint256 public constant MAX_SUPPLY = 300;

    constructor(
        string memory _contractURI
    ) ERC721("Token Art 2023", "TOKENART") {
        contractURI = _contractURI;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        //_grantRole(DEFAULT_ADMIN_ROLE, /* Steve's address here */);
    }

    // Getters
    function totalSupply() public view returns (uint256) {
        return _totalSupply.current();
    }

    /**
      @notice Allows any account assigned to a DEFAULT_ADMIN_ROLE to mint a new token
      @param to Address which will own newly minted tokens
      @param quantity Number of tokens to mint
     */
    function batchMintTo(
        address to,
        uint256 quantity
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            (totalSupply() + quantity) <= MAX_SUPPLY,
            "Cannot mint more then 300"
        );
        for (uint i = 0; i < quantity; i++) {
            uint256 tokenId = totalSupply();
            _safeMint(to, tokenId);
            _totalSupply.increment();
        }
    }

    /**
      @notice Enables any account assigned as DEFAULT_ADMIN_ROLE to set the contractURI
      @param newContractURI New contractURI string
     */
    function setContractUri(
        string memory newContractURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        contractURI = newContractURI;
    }

    /**
      @notice Enables any account assigned as DEFAULT_ADMIN_ROLE to set the baseURI
      @param newBaseURI New baseURI string
     */
    function setBaseUri(
        string memory newBaseURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        baseURI = newBaseURI;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
