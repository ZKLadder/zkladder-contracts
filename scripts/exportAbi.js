const fs = require('fs');
const contractMappings = require('../utils/contracts');

module.exports = async (taskArgs, hre) => {
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
};
