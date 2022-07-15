// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "hardhat/console.sol";

/// @custom:security-contact support@zkladder.com
contract ERC721MembershipV2 is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    AccessControlEnumerableUpgradeable,
    EIP712Upgradeable,
    UUPSUpgradeable
{
    string public contractURI;
    address payable public beneficiaryAddress;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct MemberTier {
        string tierURI; // URI pointing to arbitrary metadata
        uint96 royaltyBasis;
        uint256 salePrice;
        bool isTransferable;
    }

    struct TierUpdate {
        uint32 tierId;
        MemberTier tierUpdates;
    }

    MemberTier[] private memberTiers;

    // Maps tokenId -> memberTierId
    mapping(uint256 => uint32) public tokenTiers;

    struct MintVoucher {
        // Minter's allowed balance after mint has occured.
        // Ie. if the voucher is valid for a single token, balance = balanceOf(minter)+1
        uint256 balance;
        uint32 tierId;
        address minter;
        bytes signature;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol,
        string memory contractUri,
        address payable beneficiary
    ) external initializer {
        require(beneficiary != address(0), "Beneficiary cannot be 0 address");

        __ERC721_init(name, symbol);
        __ERC721URIStorage_init();
        __AccessControlEnumerable_init();
        __EIP712_init(name, "1");
        __UUPSUpgradeable_init();

        contractURI = contractUri;
        beneficiaryAddress = beneficiary;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _totalSupply;

    function totalSupply() public view returns (uint256) {
        return _totalSupply.current();
    }

    function totalTiers() public view returns (uint256) {
        return memberTiers.length;
    }

    function tierInfo(uint32 id) public view returns (MemberTier memory) {
        require(id < memberTiers.length, "Invalid tierId");
        return memberTiers[id];
    }

    /**
     * EIP-2981 compliant royalty info
     */
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        uint32 tierId = tokenTiers[_tokenId];
        MemberTier memory tier = tierInfo(tierId);

        return (
            beneficiaryAddress,
            uint256((_salePrice * tier.royaltyBasis) / 10000)
        );
    }

    /**
      Adds memberTiers to contract storage
      @param addedTiers Array of new tiers to add.
     */
    function addTiers(MemberTier[] memory addedTiers)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        for (uint256 i = 0; i < addedTiers.length; i++) {
            memberTiers.push(addedTiers[i]);
        }
    }

    /**
      Updates existing memberTiers
      @param updatedTiers Array of update structs storing id of tiers to update and new fields
     */
    function updateTiers(TierUpdate[] memory updatedTiers)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        for (uint256 i = 0; i < updatedTiers.length; i++) {
            require(
                updatedTiers[i].tierId < totalTiers(),
                "Updating nonexistent tier"
            );
            memberTiers[updatedTiers[i].tierId] = updatedTiers[i].tierUpdates;
        }
    }

    function setContractUri(string memory newContractURI)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        contractURI = newContractURI;
    }

    function setBeneficiary(address payable newBeneficiary)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            newBeneficiary != address(0),
            "Beneficiary cannot be 0 address"
        );
        beneficiaryAddress = newBeneficiary;
    }

    /**
      @notice Allows any account assigned to a MINTER_ROLE to mint a new token
      @param to Address of new token owner
      @param tierId Id of the tier that this token will belong to
      @param tokenUri IPFS hash or URI of token metadata
     */
    function mintTo(
        address to,
        uint32 tierId,
        string memory tokenUri
    ) external onlyRole(MINTER_ROLE) {
        require(tierId < totalTiers(), "Invalid tierId");
        require(bytes(tokenUri).length > 0, "tokenUri must be set");

        uint256 tokenId = totalSupply();

        tokenTiers[tokenId] = tierId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        _totalSupply.increment();
    }

    /**
      @notice Public function enabling any account to mint with a mintVoucher signed by an account granted a MINTER_ROLE
      @param voucher A signed mint voucher
      @param tokenUri IPFS hash or URI of token metadata
     */
    function mint(MintVoucher calldata voucher, string memory tokenUri)
        external
        payable
    {
        require(bytes(tokenUri).length > 0, "tokenUri must be set");

        MemberTier memory tier = tierInfo(voucher.tierId);

        require(msg.value >= tier.salePrice, "Value sent is too low");

        address signer = _verify(voucher);
        require(hasRole(MINTER_ROLE, signer), "Signature invalid");

        uint256 balance = balanceOf(voucher.minter);
        require(voucher.balance > balance, "Cannot mint any more tokens");

        uint256 tokenId = totalSupply();

        tokenTiers[tokenId] = voucher.tierId;
        _safeMint(voucher.minter, tokenId);
        _setTokenURI(tokenId, tokenUri);
        _totalSupply.increment();

        (bool success, bytes memory returnData) = beneficiaryAddress.call{
            value: msg.value
        }("");

        require(success, "Failed transfer to beneficiary");
    }

    //Hook ensuring that transfers of non-transferable tokens fail
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Upgradeable) {
        if (from != address(0)) {
            uint32 tierId = tokenTiers[tokenId];
            MemberTier memory tier = tierInfo(tierId);
            require(
                (tier.isTransferable ||
                    hasRole(DEFAULT_ADMIN_ROLE, from) ||
                    hasRole(DEFAULT_ADMIN_ROLE, to)),
                "This token is non transferable"
            );
        }
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    // Internal functions
    function _hash(MintVoucher calldata voucher)
        internal
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "mintVoucher(uint256 balance,uint32 tierId,address minter)"
                        ),
                        voucher.balance,
                        voucher.tierId,
                        voucher.minter
                    )
                )
            );
    }

    function _verify(MintVoucher calldata voucher)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hash(voucher);
        return ECDSAUpgradeable.recover(digest, voucher.signature);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
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
        override(ERC721Upgradeable, AccessControlEnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
