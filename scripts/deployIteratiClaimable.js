/* eslint-disable no-console, no-restricted-syntax, no-await-in-loop */
const contracts = require('../utils/contracts');

module.exports = async (taskArgs, hre) => {
  const { withproxies } = taskArgs;
  const template = contracts[7];

  // Designated deployer EOA
  const deployer = new hre.ethers.Wallet(process.env.TOKENART_PRIVATE_KEY, hre.ethers.provider);

  // Contract is being deployed to local network
  if (hre.network.name === 'localhost') {
    const hardhatAccount = await hre.ethers.getSigner();

    // Transfer 10 ETH from local hardhate account to designated deployer account for gas
    const tx = await hardhatAccount.sendTransaction({
      to: deployer.address,
      value: hre.ethers.utils.parseEther('10.0'),
    });
    await tx.wait();

    const logicContract = await hre.ethers.getContractFactory(
      template.name,
      deployer,
    );

    const logicInstance = await logicContract.deploy();

    const { gasUsed: gasUsedLogic } = await logicInstance.deployTransaction.wait();

    console.log(`Logic ${template.name} deployed to ${logicInstance.address}`);
    console.log(`Gas used: ${gasUsedLogic} \n`);

    /* If 'withproxies' flag is set, deploy storage contracts alongside
      all of the previously deployed implementation contracts */
    if (withproxies === 'true') {
      const abi = [
        template.initializer,
      ];

      const iface = new hre.ethers.utils.Interface(abi);
      const abiEncoded = iface.encodeFunctionData('initialize', template.mockArgs);

      const storageContract = await hre.ethers.getContractFactory('ZKProxy', deployer);
      const storageInstance = await storageContract.deploy(
        logicInstance.address,
        abiEncoded,
      );

      const { gasUsed: gasUsedStorage } = await storageInstance.deployTransaction.wait();

      console.log(`Storage ${template.name} deployed to ${storageInstance.address}`);
      console.log(`Gas used: ${gasUsedStorage} \n`);
    }
    // Contract is being deployed to a public chain (can be testnets or mainnets)
  } else {
    try {
      const logicContract = await hre.ethers.getContractFactory(
        template.name,
        deployer,
      );

      const logicInstance = await logicContract.deploy({ gasLimit: 6000000 });

      const { gasUsed: gasUsedLogic } = await logicInstance.deployTransaction.wait();

      console.log(`\nLogic ${template.name} deployed to ${logicInstance.address}`);
      console.log(`Gas used: ${gasUsedLogic} \n`);
    } catch (error) { // Catch and log any errors
      console.log(error);
    }
  }
};
