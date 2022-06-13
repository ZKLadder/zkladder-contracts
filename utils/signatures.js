/* eslint-disable no-underscore-dangle */
const { ethToWei } = require('./conversions');

const ERC721MembershipVoucher = async (options) => {
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
    balance,
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
      { name: 'minter', type: 'address' },
    ],
  };

  const value = {
    balance,
    minter,
  };

  const signature = await signer._signTypedData(domain, types, value);

  return {
    balance,
    minter,
    signature,
  };
};

module.exports = {
  ERC721MembershipVoucher,
  ERC721MembershipV2Voucher,
};
