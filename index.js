const erc721Whitelisted = require('./artifacts/contracts/ERC721_Whitelisted.sol/ERC721_Whitelisted.json');

module.exports = {
  1: {
    name: 'ERC721_Whitelisted',
    id: 1,
    src: 'contracts/ERC721_Whitelisted.sol',
    ...erc721Whitelisted,
  },
};
