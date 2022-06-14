require('@nomiclabs/hardhat-ethers');
require('dotenv/config');
require('hardhat-gas-reporter');
const { task, types } = require('hardhat/config');
const exportAbi = require('./scripts/exportAbi');
const flatten = require('./scripts/flatten');
const deploy = require('./scripts/deploy');

const networks = {
  localhost: {
    url: 'http://localhost:8545',
    chainId: 31337,
    account: [process.env.HARDHAT_PRIVATE_KEY],
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

task('deploy', 'Deploys contract to specified network')
  .addParam('templateId', 'Contract template to be deployed')
  .setAction(deploy);
