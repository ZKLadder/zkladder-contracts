// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

/// @custom:security-contact support@zkladder.com
contract ERC721Art is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    AccessControlEnumerableUpgradeable,
    EIP712Upgradeable,
    UUPSUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string public contractURI;

    //Address to receive mint proceeds and all royalties
    address payable public beneficiaryAddress;

    // Royalty in basis points ie. 500 = 5%
    uint96 public royaltyBasis;

    //Cost of each NFT mint
    uint256 public salePrice;

    struct MintVoucher {
        uint256 tokenId;
        address minter;
        string tokenUri;
        bytes signature;
    }

    struct BatchMintToPayload {
        address to;
        uint256 tokenId;
        string tokenUri;
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
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __AccessControlEnumerable_init();
        __EIP712_init(name, "1");
        __UUPSUpgradeable_init();

        contractURI = contractUri;
        beneficiaryAddress = beneficiary;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * EIP-2981 compliant royalty info
     */
    function royaltyInfo(
        uint256 _tokenId,
        uint256 _salePrice
    ) external view returns (address receiver, uint256 royaltyAmount) {
        return (
            beneficiaryAddress,
            uint256((_salePrice * royaltyBasis) / 10000)
        );
    }

    function setContractUri(
        string memory newContractURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        contractURI = newContractURI;
    }

    function setBeneficiary(
        address payable newBeneficiary
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            newBeneficiary != address(0),
            "Beneficiary cannot be 0 address"
        );
        beneficiaryAddress = newBeneficiary;
    }

    function setRoyalty(uint96 royalty) external onlyRole(DEFAULT_ADMIN_ROLE) {
        royaltyBasis = royalty;
    }

    function setSalePrice(uint256 price) external onlyRole(DEFAULT_ADMIN_ROLE) {
        salePrice = price;
    }

    /**
      @notice Allows any account assigned to a MINTER_ROLE to mint a new token
      @param to Address of new token owner
      @param tokenId TokenId to of newly minted token
      @param tokenUri IPFS hash or URI of token metadata
     */
    function mintTo(
        address to,
        uint256 tokenId,
        string memory tokenUri
    ) public onlyRole(MINTER_ROLE) {
        require(bytes(tokenUri).length > 0, "tokenUri must be set");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
    }

    /**
      @notice Allows any account assigned to a MINTER_ROLE to batch mint new tokens
      @param tokens Array of MintPayload objects to mint
     */
    function batchMintTo(
        BatchMintToPayload[] calldata tokens
    ) external onlyRole(MINTER_ROLE) {
        for (uint i = 0; i < tokens.length; i++) {
            mintTo(tokens[i].to, tokens[i].tokenId, tokens[i].tokenUri);
        }
    }

    /**
      @notice Public function enabling any account to mint with a mintVoucher signed by an account granted a MINTER_ROLE
      @param voucher A signed mint voucher
     */
    function mint(MintVoucher calldata voucher) external payable {
        require(bytes(voucher.tokenUri).length > 0, "tokenUri must be set");
        require(msg.value == salePrice, "Value sent is not correct");

        address signer = _verify(voucher);
        require(hasRole(MINTER_ROLE, signer), "Signature invalid");

        _safeMint(voucher.minter, voucher.tokenId);
        _setTokenURI(voucher.tokenId, voucher.tokenUri);

        (bool success, bytes memory returnData) = beneficiaryAddress.call{
            value: msg.value
        }("");

        require(success, "Failed transfer to beneficiary");
    }

    /**
      @notice Public function enabling any account to mint up to 50 MintVouchers in a single transaction
      @param vouchers An array of signed mint vouchers
     */
    function batchMint(MintVoucher[] calldata vouchers) external payable {
        require(vouchers.length <= 50, "Cannot mint more than 50 tokens");
        require(
            msg.value == (salePrice * vouchers.length),
            "Value sent is not correct"
        );

        for (uint i = 0; i < vouchers.length; i++) {
            require(
                bytes(vouchers[i].tokenUri).length > 0,
                "tokenUri must be set"
            );

            address signer = _verify(vouchers[i]);
            require(hasRole(MINTER_ROLE, signer), "Signature invalid");

            _safeMint(vouchers[i].minter, vouchers[i].tokenId);
            _setTokenURI(vouchers[i].tokenId, vouchers[i].tokenUri);
        }

        (bool success, bytes memory returnData) = beneficiaryAddress.call{
            value: msg.value
        }("");

        require(success, "Failed transfer to beneficiary");
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // Internal functions
    function _hash(
        MintVoucher calldata voucher
    ) private view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "mintVoucher(uint256 tokenId,address minter,string tokenUri)"
                        ),
                        voucher.tokenId,
                        voucher.minter,
                        keccak256(bytes(voucher.tokenUri))
                    )
                )
            );
    }

    function _verify(
        MintVoucher calldata voucher
    ) private view returns (address) {
        bytes32 digest = _hash(voucher);
        return ECDSAUpgradeable.recover(digest, voucher.signature);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable,
            AccessControlEnumerableUpgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
