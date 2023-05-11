/* eslint-disable no-console, no-restricted-syntax, no-await-in-loop */
const contracts = require('../utils/contracts');

module.exports = async (taskArgs, hre) => {
  const template = contracts[6];

  // Designated deployer EOA
  const deployer = new hre.ethers.Wallet(process.env.TOKENART_PRIVATE_KEY, hre.ethers.provider);

  // Contract is being deployed to local network
  if (hre.network.name === 'localhost') {
    const hardhatAccount = await hre.ethers.getSigner();

    // Transfer 10 ETH from local hardhat account to designated deployer account for gas
    const tx = await hardhatAccount.sendTransaction({
      to: deployer.address,
      value: hre.ethers.utils.parseEther('10.0'),
    });
    await tx.wait();
  }

  const contract = await hre.ethers.getContractFactory(template.name, deployer);

  const instance = await contract.deploy(...template.mockArgs, {
    gasLimit: 6000000,
  });

  await instance.deployed;

  const { gasUsed } = await instance.deployTransaction.wait();

  console.log(`${template.name} deployed to ${instance.address}.`);
  console.log(`Gas used: ${gasUsed} \n`);
};
