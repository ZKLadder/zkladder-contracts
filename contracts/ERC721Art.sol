// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721RoyaltyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract ERC721Art is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    ERC721RoyaltyUpgradeable,
    AccessControlEnumerableUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string public contractURI;

    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _totalSupply;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol,
        string memory contractUri,
        address beneficiary,
        uint96 defaultRoyalty
    ) external initializer {
        __ERC721_init(name, symbol);
        __ERC721URIStorage_init();
        __ERC721Royalty_init();
        __AccessControlEnumerable_init();
        __UUPSUpgradeable_init();

        contractURI = contractUri;
        _setDefaultRoyalty(beneficiary, defaultRoyalty);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply.current();
    }

    function setContractUri(string memory newContractURI)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        contractURI = newContractURI;
    }

    function setRoyalty(address beneficiary, uint96 royaltyBasis)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setDefaultRoyalty(beneficiary, royaltyBasis);
    }

    function setRoyalty(
        uint256 tokenId,
        address beneficiary,
        uint96 royaltyBasis
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setTokenRoyalty(tokenId, beneficiary, royaltyBasis);
    }

    /**
      @notice Allows any account assigned to a MINTER_ROLE to mint a new token
      @param to Address of new token owner
      @param tokenUri IPFS hash or URI of token metadata
     */
    function mint(address to, string memory tokenUri)
        external
        onlyRole(MINTER_ROLE)
    {
        uint256 tokenId = totalSupply();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        _totalSupply.increment();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(
            ERC721Upgradeable,
            ERC721URIStorageUpgradeable,
            ERC721RoyaltyUpgradeable
        )
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(
            ERC721Upgradeable,
            AccessControlEnumerableUpgradeable,
            ERC721RoyaltyUpgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
