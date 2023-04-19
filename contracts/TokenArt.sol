// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface TokenURIContract {
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

/**
  @title Token Art Art Tokens
  @author Token Art x ZKLadder
 */
contract TokenArt is ERC721, AccessControl {
    // Collection level metadata
    string public contractURI;

    address private tokenURIContract;

    using Counters for Counters.Counter;
    Counters.Counter private _totalSupply;

    uint128 public constant MAX_SUPPLY = 300;
    uint128 private royaltyBasis = 500;

    constructor(
        string memory _contractURI
    ) ERC721("Token Art Art Tokens", "TOKEN") {
        contractURI = _contractURI;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(
            DEFAULT_ADMIN_ROLE,
            0x47144372eb383466D18FC91DB9Cd0396Aa6c87A4
        );
    }

    // Getters
    function totalSupply() public view returns (uint256) {
        return _totalSupply.current();
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            tokenId < totalSupply(),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return TokenURIContract(tokenURIContract).tokenURI(tokenId);
    }

    /**
     * EIP-2981 compliant royalty info
     */
    function royaltyInfo(
        uint256 _tokenId,
        uint256 _salePrice
    ) external view returns (address receiver, uint256 royaltyAmount) {
        return (tokenURIContract, uint256((_salePrice * royaltyBasis) / 10000));
    }

    /**
      @notice Allows any account assigned the DEFAULT_ADMIN_ROLE to mint new tokens
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
      @notice Enables any account assigned the DEFAULT_ADMIN_ROLE to set the contractURI
      @param newContractURI New contractURI string
     */
    function setContractUri(
        string memory newContractURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        contractURI = newContractURI;
    }

    /**
      @notice Enables any account assigned the DEFAULT_ADMIN_ROLE to set the tokenURIContract
      @param newTokenURIContract New contractURI string
     */
    function setTokenURIContract(
        address newTokenURIContract
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenURIContract = newTokenURIContract;
    }

    /**
      @notice Enables any account assigned the DEFAULT_ADMIN_ROLE to set recommended royalty in basis points
      @param newRoyaltyBasis New contractURI string
     */
    function setRoyaltyBasis(
        uint128 newRoyaltyBasis
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRoyaltyBasis <= 10000, "ERC2981Royalties: Too high");
        royaltyBasis = newRoyaltyBasis;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
