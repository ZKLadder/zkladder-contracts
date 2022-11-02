/* eslint-disable no-console, no-restricted-syntax, no-await-in-loop */
const contracts = require('../utils/contracts');

module.exports = async (taskArgs, hre) => {
  const { templateid, withproxies } = taskArgs;
  const template = contracts[templateid];

  // Designated deployer EOA
  const deployer = new hre.ethers.Wallet(process.env.EVM_PRIVATE_KEY, hre.ethers.provider);

  // Contract is being deployed to local network
  if (hre.network.name === 'localhost') {
    const hardhatAccount = await hre.ethers.getSigner();

    // Transfer 10 ETH from local hardhate account to designated deployer account for gas
    const tx = await hardhatAccount.sendTransaction({
      to: deployer.address,
      value: hre.ethers.utils.parseEther('10.0'),
    });
    await tx.wait();

    // Non-upgradeable contracts can be deployed locally with no additional steps
    if (!template.isUpgradeable) {
      const contract = await hre.ethers.getContractFactory(template.name, deployer);
      const instance = await contract.deploy(...template.mockArgs);

      await instance.deployed;

      const { gasUsed } = await instance.deployTransaction.wait();

      console.log(`${template.name} deployed to ${instance.address}.`);
      console.log(`Gas used: ${gasUsed} \n`);
    } else {
      /* Upgradeable contracts must all be deployed in sequence to preserve the
      predetermined address of the implementation contract */
      for (const upgradeableTemplate of Object.values(contracts)
        .filter((contract) => (contract.isUpgradeable))) {
        const logicContract = await hre.ethers.getContractFactory(
          upgradeableTemplate.name,
          deployer,
        );

        const logicInstance = await logicContract.deploy();

        const { gasUsed: gasUsedLogic } = await logicInstance.deployTransaction.wait();

        console.log(`Logic ${upgradeableTemplate.name} deployed to ${logicInstance.address}`);
        console.log(`Gas used: ${gasUsedLogic} \n`);
      }

      /* If 'withproxies' flag is set, deploy storage contracts alongside
      all of the previously deployed implementation contracts */
      if (withproxies === 'true') {
        for (const upgradeableTemplate of Object.values(contracts)
          .filter((contract) => (contract.isUpgradeable))) {
          const abi = [
            upgradeableTemplate.initializer,
          ];

          const iface = new hre.ethers.utils.Interface(abi);
          const abiEncoded = iface.encodeFunctionData('initialize', upgradeableTemplate.mockArgs);

          const storageContract = await hre.ethers.getContractFactory('ZKProxy', deployer);
          const storageInstance = await storageContract.deploy(
            upgradeableTemplate.address,
            abiEncoded,
          );

          const { gasUsed: gasUsedStorage } = await storageInstance.deployTransaction.wait();

          console.log(`Storage ${upgradeableTemplate.name} deployed to ${storageInstance.address}`);
          console.log(`Gas used: ${gasUsedStorage} \n`);
        }
      }
    }
    // Contract is being deployed to a public chain (can be testnets or mainnets)
  } else {
    // Non-upgradeable contracts should never be deployed to public chains using this script
    if (!template.isUpgradeable) throw new Error('This contract is not upgradeable');

    // Ensure contracts are deployed in the correct order to preserve one address across all chains
    const nonce = await deployer.getTransactionCount();
    const newContractAddress = hre.ethers.utils.getContractAddress({
      from: deployer.address,
      nonce,
    });
    if (newContractAddress !== template.address) throw new Error(`You are deploying this contract out of order. Current nonce is ${nonce}`);

    // If predicted address is correct, attempt to deploy contract to public chain
    try {
      const logicContract = await hre.ethers.getContractFactory(
        template.name,
        deployer,
      );

      const logicInstance = await logicContract.deploy();

      const { gasUsed: gasUsedLogic } = await logicInstance.deployTransaction.wait();

      console.log(`\nLogic ${template.name} deployed to ${logicInstance.address}`);
      console.log(`Gas used: ${gasUsedLogic} \n`);
    } catch (error) { // Catch and log any errors
      console.log(error);
    }
  }
};
