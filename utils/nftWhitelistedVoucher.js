/* eslint-disable no-underscore-dangle */
const { ethToWei } = require('./conversions');

module.exports = async (options) => {
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
