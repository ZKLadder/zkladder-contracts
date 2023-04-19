module.exports = {
  1: {
    name: 'ERC721MembershipV1',
    id: 1,
    src: 'contracts/ERC721MembershipV1.sol',
    mockArgs: ['TestContract', 'TST', 'https://contractUri', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
  },
  2: {
    name: 'ZKProxy',
    id: 2,
    src: 'contracts/ZKProxy.sol',
  },
  3: {
    name: 'ERC721MembershipV2',
    id: 3,
    src: 'contracts/ERC721MembershipV2.sol',
    mockArgs: ['TestArt', 'ART', 'https://contractUri', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
    isUpgradeable: true,
    initializer: 'function initialize(string name, string symbol, string contractUri, address beneficiary)',
    address: '0x36aB4f7FE132D86d61cb51a00E8faD3e63f95eC4',
  },
  4: {
    name: 'ERC721Art',
    id: 4,
    src: 'contracts/ERC721Art.sol',
    mockArgs: ['TestArt', 'ART', 'https://contractUri', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
    isUpgradeable: true,
    initializer: 'function initialize(string name, string symbol, string contractUri, address beneficiary)',
    address: '0x79F3CF659A974cCd33F9a8389b921f73280A0042',
  },
  5: {
    name: 'TokenArt',
    id: 5,
    src: 'contracts/TokenArt.sol',
    mockArgs: ['ipfs://bafkreiccws5pbfpg6mfny4ax3vsftdqaw3ikqcxs7zjawt4hooljkjf2bu'],
  },

  // 5 0xCBA96aEB45Ce7Dc7B6bD876dB1b560D0A5d2399b
  // 6 0x7887C6Dd437C292e2fb661F9D38E8A8DfA03b4f1
  // 7 0x06f2c8E17C523F3aD52B49bE5C189B52932C170b
  // 8 0x6f22b26724CFbB42d81d0da9076c0Cf8c69cf26f
  // 9 0x5773D3BeBD40847e31101ea48f142c12393cd573
  // 10 0x96a73285a1F8d4Ba791Fb69b038EC21cb0072Ce5
  // 11 0x2E759F5b44D0b7a7fb61Cf9150F1F43816604676
  // 12 0x1446CE2F4f9Cf2aFC5B6be7a6c3B169B94f20345

};
