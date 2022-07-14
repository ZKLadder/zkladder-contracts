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
    address: '0x8b6129DA45437810A40DfE8bCd509d7F1a69690b',
  },
  4: {
    name: 'ERC721Art',
    id: 4,
    src: 'contracts/ERC721Art.sol',
    mockArgs: ['TestArt', 'ART', 'https://contractUri', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 500],
    isUpgradeable: true,
    initializer: 'function initialize(string name, string symbol, string contractUri, address beneficiary, uint96 defaultRoyalty)',
    address: '0x20970b7830bCf2166207A73CF4894197946BEEef',
  },

};
