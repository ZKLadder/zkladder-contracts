const { task } = require('hardhat/config');
const fs = require('fs');
const contractMappings = require('./utils/contracts');
require('@nomiclabs/hardhat-ethers');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.2',
  paths: {
    tests: './tests',
  },
};

task('export-abi', 'Exports the contract metadata, abi and bytecode into an object usable by Ethers').setAction(
  async (taskArgs, hre) => {
    const abis = {};

    await hre.run('clean');
    await hre.run('compile');

    Object.keys(contractMappings).forEach((templateId) => {
      const { name } = contractMappings[templateId];
      const { abi, bytecode } = JSON.parse(fs.readFileSync(`./artifacts/contracts/${name}.sol/${name}.json`));
      abis[templateId] = {
        ...contractMappings[templateId],
        abi,
        bytecode,
      };
    });

    fs.writeFileSync('./abi.json', JSON.stringify(abis, null, 2));
  },
);
