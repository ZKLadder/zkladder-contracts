require('@nomiclabs/hardhat-ethers');
require('dotenv/config');
require('hardhat-gas-reporter');
const { task, types } = require('hardhat/config');
const exportAbi = require('./scripts/exportAbi');
const flatten = require('./scripts/flatten');
const deploy = require('./scripts/deploy');
const deployTokenArt = require('./scripts/deployTokenArt');
const deployZKClaimable = require('./scripts/deployZKClaimable');

const networks = {
  localhost: {
    url: 'http://localhost:8545',
    chainId: 31337,
    accounts: process.env.CI ? undefined : [process.env.HARDHAT_PRIVATE_KEY],
  },
  goerli: {
    url: 'https://goerli.infura.io/v3/28445607a2834ee1ab47ead0ef9e13f4',
    chainId: 5,
    accounts: process.env.CI ? undefined : [process.env.EVM_PRIVATE_KEY],
  },
  sepolia: {
    url: 'https://sepolia.infura.io/v3',
    chainId: 11155111,
    accounts: process.env.CI ? undefined : [process.env.EVM_PRIVATE_KEY],
  },
  mumbai: {
    url: 'https://polygon-mumbai.infura.io/v3/28445607a2834ee1ab47ead0ef9e13f4',
    chainId: 80001,
    accounts: process.env.CI ? undefined : [process.env.EVM_PRIVATE_KEY],
  },
  polygon: {
    url: 'https://polygon.llamarpc.com',
    chainId: 137,
    accounts: process.env.CI ? undefined : [process.env.EVM_PRIVATE_KEY],
  },
  mainnet: {
    url: 'https://mainnet.infura.io/v3/28445607a2834ee1ab47ead0ef9e13f4',
    chainId: 1,
    accounts: process.env.CI ? undefined : [process.env.EVM_PRIVATE_KEY],
  },
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: '0.8.2',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    tests: './tests',
  },
  networks,
  gasReporter: {
    enabled: (process.env.REPORT_GAS === 'true'),
  },
};

task('export-abi', 'Exports the contract metadata, abi and bytecode into an object usable by Ethers')
  .setAction(exportAbi);

task('flatten-file', 'Flattens a contracts source code so that it may be verified on etherscan')
  .addParam('templateid', 'Contract template to be flattened')
  .addParam('targetfile', 'Name of file which will contain the flattened source code', undefined, types.string, true)
  .addParam('license', 'SPDX license identifier for flattened source', undefined, types.string, true)
  .setAction(flatten);

task('deploy', 'Deploys instance of contract to specified network')
  .addParam('templateid', 'Contract template to be deployed')
  .addParam('withproxies', "Pass in 'true' to deploy proxies alongside upgradeable implementation contracts")
  .setAction(deploy);

task('deployTokenArt', 'Deploys instance of Token Art').setAction(deployTokenArt);

task('deployZKClaimable', 'Deploys instance of ZKClaimable contract').setAction(deployZKClaimable);
