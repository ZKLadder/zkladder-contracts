/* eslint-disable no-console */
const contracts = require('../utils/contracts');

const proxies = ['3', '4'];

module.exports = async (taskArgs, hre) => {
  const { templateId } = taskArgs;
  const template = contracts[templateId];

  if (proxies.includes(templateId)) {
    const logicContract = await hre.ethers.getContractFactory(template.name);
    const logicInstance = await logicContract.deploy();

    const { gasUsed: gasUsedLogic } = await logicInstance.deployTransaction.wait();

    const abi = [
      template.initializer,
    ];

    const iface = new hre.ethers.utils.Interface(abi);
    const abiEncoded = iface.encodeFunctionData('initialize', template.mockArgs);

    const storageContract = await hre.ethers.getContractFactory('ZKProxy');
    const storageInstance = await storageContract.deploy(
      logicInstance.address,
      abiEncoded,
    );

    const { gasUsed: gasUsedStorage } = await storageInstance.deployTransaction.wait();

    console.log(`\nLogic ${template.name} deployed to ${logicInstance.address}`);
    console.log(`Gas used: ${gasUsedLogic} \n`);
    console.log(`Storage ${template.name} deployed to ${storageInstance.address}`);
    console.log(`Gas used: ${gasUsedStorage} \n`);
  } else {
    const contract = await hre.ethers.getContractFactory(template.name);
    const instance = await contract.deploy(...template.mockArgs);

    await instance.deployed;

    const { gasUsed } = await instance.deployTransaction.wait();

    console.log(`${template.name} deployed to ${instance.address}.`);
    console.log(`Gas used: ${gasUsed} \n`);
  }
};
