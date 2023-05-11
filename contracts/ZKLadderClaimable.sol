// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
  @title Watchful AI's
  @author ZKLadder
 */
contract ZKLadderClaimable is ERC721, AccessControl {
    // Collection level metadata
    string public contractURI;

    // baseURI for all tokenURI's
    string private baseURI;

    using Counters for Counters.Counter;
    Counters.Counter private _totalSupply;

    uint256 public maxSupply = 217;

    constructor(string memory _contractURI) ERC721("WatchfulAIs", "AUTH") {
        contractURI = _contractURI;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Getters
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

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
            (totalSupply() + quantity) <= maxSupply,
            "Cannot mint more then maxSupply"
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

    /**
      @notice Enables any account assigned as DEFAULT_ADMIN_ROLE to set a new maxSupply
      @param newMaxSupply New max supply of tokens
     */
    function setMaxSupply(
        uint256 newMaxSupply
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxSupply = newMaxSupply;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
