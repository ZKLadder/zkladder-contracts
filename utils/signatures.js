/* eslint-disable no-underscore-dangle */
const { ethToWei } = require('./conversions');

const ERC721MembershipV1Voucher = async (options) => {
  const {
    chainId,
    contractName,
    contractAddress,
    wallet,
    balance,
    salePrice,
    minter,
  } = options;

  const signer = wallet;

  const domain = {
    chainId,
    name: contractName,
    verifyingContract: contractAddress,
    version: '1',
  };

  const types = {
    mintVoucher: [
      { name: 'balance', type: 'uint256' },
      { name: 'salePrice', type: 'uint256' },
      { name: 'minter', type: 'address' },
    ],
  };

  const salePriceInWei = ethToWei(salePrice);

  const value = {
    balance,
    minter,
    salePrice: salePriceInWei.toString(),
  };

  const signature = await signer._signTypedData(domain, types, value);

  return {
    balance,
    minter,
    salePrice: salePriceInWei,
    signature,
  };
};

const ERC721MembershipV2Voucher = async (options) => {
  const {
    chainId,
    contractName,
    contractAddress,
    wallet,
    tokenId,
    tierId,
    minter,
    tokenUri,
  } = options;

  const signer = wallet;

  const domain = {
    chainId,
    name: contractName,
    verifyingContract: contractAddress,
    version: '1',
  };

  const types = {
    mintVoucher: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'tierId', type: 'uint32' },
      { name: 'minter', type: 'address' },
      { name: 'tokenUri', type: 'string' },
    ],
  };

  const value = {
    tokenId,
    tierId,
    minter,
    tokenUri,
  };

  const signature = await signer._signTypedData(domain, types, value);

  return {
    tokenId,
    tierId,
    minter,
    tokenUri,
    signature,
  };
};

const ERC721ArtVoucher = async (options) => {
  const {
    chainId,
    contractName,
    contractAddress,
    wallet,
    tokenId,
    minter,
    tokenUri,
  } = options;

  const signer = wallet;

  const domain = {
    chainId,
    name: contractName,
    verifyingContract: contractAddress,
    version: '1',
  };

  const types = {
    mintVoucher: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'minter', type: 'address' },
      { name: 'tokenUri', type: 'string' },
    ],
  };

  const value = {
    tokenId,
    minter,
    tokenUri,
  };

  const signature = await signer._signTypedData(domain, types, value);

  return {
    tokenId,
    minter,
    tokenUri,
    signature,
  };
};

module.exports = {
  ERC721MembershipV1Voucher,
  ERC721MembershipV2Voucher,
  ERC721ArtVoucher,
};
