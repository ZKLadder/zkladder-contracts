const { ethers } = require('hardhat');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const { utils, BigNumber } = require('ethers');
const { ethToWei } = require('../utils/conversions');
const { ERC721MembershipV2Voucher } = require('../utils/signatures');
const { initializer } = require('../utils/contracts')[3];

chai.use(chaiSubset);
const { expect } = chai;

const iface = new utils.Interface([initializer]);

describe('ERC721MembershipV2', () => {
  let signers;
  let ERC721MembershipV2Logic;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    const logicFactory = await ethers.getContractFactory('ERC721MembershipV2');
    ERC721MembershipV2Logic = await logicFactory.deploy();
    await ERC721MembershipV2Logic.deployTransaction.wait();
  });

  it('Correctly deploys proxies', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const proxy2 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock2', 'MCK2', 'mockUri2', signers[1].address,
      ]),
    );

    const proxy3 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock3', 'MCK3', 'mockUri3', signers[2].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();
    const { contractAddress: address2 } = await proxy2.deployTransaction.wait();
    const { contractAddress: address3 } = await proxy3.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);
    const instance2 = ERC721MembershipV2Logic.attach(address2);
    const instance3 = ERC721MembershipV2Logic.attach(address3);

    expect(await instance1.name()).to.equal('Mock1');
    expect(await instance2.name()).to.equal('Mock2');
    expect(await instance3.name()).to.equal('Mock3');
    expect(await instance1.symbol()).to.equal('MCK1');
    expect(await instance2.symbol()).to.equal('MCK2');
    expect(await instance3.symbol()).to.equal('MCK3');
    expect(await instance1.contractURI()).to.equal('mockUri1');
    expect(await instance2.contractURI()).to.equal('mockUri2');
    expect(await instance3.contractURI()).to.equal('mockUri3');
    expect(await instance1.beneficiaryAddress()).to.equal(signers[0].address);
    expect(await instance2.beneficiaryAddress()).to.equal(signers[1].address);
    expect(await instance3.beneficiaryAddress()).to.equal(signers[2].address);
    expect(await instance1.hasRole('0x0000000000000000000000000000000000000000000000000000000000000000', signers[0].address)).to.equal(true);
    expect(await instance2.hasRole('0x0000000000000000000000000000000000000000000000000000000000000000', signers[0].address)).to.equal(true);
    expect(await instance3.hasRole('0x0000000000000000000000000000000000000000000000000000000000000000', signers[0].address)).to.equal(true);
    expect(await instance1.hasRole(utils.keccak256(utils.toUtf8Bytes('MINTER_ROLE')), signers[0].address)).to.equal(true);
    expect(await instance2.hasRole(utils.keccak256(utils.toUtf8Bytes('MINTER_ROLE')), signers[0].address)).to.equal(true);
    expect(await instance3.hasRole(utils.keccak256(utils.toUtf8Bytes('MINTER_ROLE')), signers[0].address)).to.equal(true);
  });

  it('Contract admin able to add single tier', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    expect((await instance1.totalTiers()).toNumber()).to.equal(0);

    try {
      await instance1.tierInfo(0);
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('call revert exception; VM Exception while processing transaction: reverted with reason string "Invalid tierId" [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="tierInfo(uint32)", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e496e76616c696420746965724964000000000000000000000000000000000000", errorArgs=["Invalid tierId"], errorName="Error", errorSignature="Error(string)", reason="Invalid tierId", code=CALL_EXCEPTION, version=abi/5.6.3)');
    }

    const newTier = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(500),
      salePrice: ethToWei(1),
      isTransferable: true,
    };

    await (await instance1.addTiers([newTier])).wait();

    expect((await instance1.totalTiers()).toNumber()).to.equal(1);

    const contractTier = await instance1.tierInfo(0);

    expect(contractTier).to.containSubset(newTier);
  });

  it('Contract admin able to add multiple tiers', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    expect((await instance1.totalTiers()).toNumber()).to.equal(0);

    try {
      await instance1.tierInfo(0);
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('call revert exception; VM Exception while processing transaction: reverted with reason string "Invalid tierId" [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="tierInfo(uint32)", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e496e76616c696420746965724964000000000000000000000000000000000000", errorArgs=["Invalid tierId"], errorName="Error", errorSignature="Error(string)", reason="Invalid tierId", code=CALL_EXCEPTION, version=abi/5.6.3)');
    }

    const tier1 = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(100),
      salePrice: ethToWei(1),
      isTransferable: false,
    };

    const tier2 = {
      name: 'Member',
      royaltyBasis: BigNumber.from(200),
      salePrice: ethToWei(2),
      isTransferable: true,
    };

    const tier3 = {
      name: 'Creator',
      royaltyBasis: BigNumber.from(300),
      salePrice: ethToWei(3),
      isTransferable: true,
    };

    await (await instance1.addTiers([tier1, tier2, tier3])).wait();

    expect((await instance1.totalTiers()).toNumber()).to.equal(3);

    const contractTier1 = await instance1.tierInfo(0);
    const contractTier2 = await instance1.tierInfo(1);
    const contractTier3 = await instance1.tierInfo(2);

    expect(contractTier1).to.containSubset(tier1);
    expect(contractTier2).to.containSubset(tier2);
    expect(contractTier3).to.containSubset(tier3);
  });

  it('Non-admins should not be able to add tiers', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    const nonAdmin = instance1.connect(signers[1]);

    expect((await nonAdmin.totalTiers()).toNumber()).to.equal(0);

    try {
      await nonAdmin.tierInfo(0);
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('call revert exception; VM Exception while processing transaction: reverted with reason string "Invalid tierId" [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="tierInfo(uint32)", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e496e76616c696420746965724964000000000000000000000000000000000000", errorArgs=["Invalid tierId"], errorName="Error", errorSignature="Error(string)", reason="Invalid tierId", code=CALL_EXCEPTION, version=abi/5.6.3)');
    }

    const newTier = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(500),
      salePrice: ethToWei(1),
      isTransferable: true,
    };

    try {
      await nonAdmin.addTiers([newTier]);
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('Should throw when adding a malformed tier', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    expect((await instance1.totalTiers()).toNumber()).to.equal(0);

    try {
      await instance1.tierInfo(0);
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('call revert exception; VM Exception while processing transaction: reverted with reason string "Invalid tierId" [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="tierInfo(uint32)", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e496e76616c696420746965724964000000000000000000000000000000000000", errorArgs=["Invalid tierId"], errorName="Error", errorSignature="Error(string)", reason="Invalid tierId", code=CALL_EXCEPTION, version=abi/5.6.3)');
    }

    const newTier = {
      incorrect: 'fields',
    };

    try {
      await instance1.addTiers([newTier]);
      expect(true).to.equal(false);
    } catch (err) {
      expect(typeof err.message).to.equal('string');
    }
  });

  it('Contract admin should be able to update tiers', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    const tier1 = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(100),
      salePrice: ethToWei(1),
      isTransferable: false,
    };

    const tier2 = {
      name: 'Member',
      royaltyBasis: BigNumber.from(200),
      salePrice: ethToWei(2),
      isTransferable: true,
    };

    const tier3 = {
      name: 'Creator',
      royaltyBasis: BigNumber.from(300),
      salePrice: ethToWei(3),
      isTransferable: true,
    };

    await (await instance1.addTiers([tier1, tier2, tier3])).wait();

    expect((await instance1.totalTiers()).toNumber()).to.equal(3);

    const tier2Updated = {
      name: 'MemberV2',
      royaltyBasis: BigNumber.from(1200),
      salePrice: ethToWei(0.2),
      isTransferable: false,
    };

    const tier3Updated = {
      name: 'CreatorV2',
      royaltyBasis: BigNumber.from(1300),
      salePrice: ethToWei(0.3),
      isTransferable: false,
    };

    await (await instance1.updateTiers([
      { tierId: 1, tierUpdates: tier2Updated },
      { tierId: 2, tierUpdates: tier3Updated },
    ])).wait();

    const contractTier1 = await instance1.tierInfo(0);
    const contractTier2 = await instance1.tierInfo(1);
    const contractTier3 = await instance1.tierInfo(2);

    expect(contractTier1).to.containSubset(tier1);
    expect(contractTier2).to.containSubset(tier2Updated);
    expect(contractTier3).to.containSubset(tier3Updated);
  });

  it('Non admin should not be able to update tiers', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    const tier1 = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(100),
      salePrice: ethToWei(1),
      isTransferable: false,
    };

    const tier2 = {
      name: 'Member',
      royaltyBasis: BigNumber.from(200),
      salePrice: ethToWei(2),
      isTransferable: true,
    };

    const tier3 = {
      name: 'Creator',
      royaltyBasis: BigNumber.from(300),
      salePrice: ethToWei(3),
      isTransferable: true,
    };

    await (await instance1.addTiers([tier1, tier2, tier3])).wait();

    expect((await instance1.totalTiers()).toNumber()).to.equal(3);

    const nonAdmin = instance1.connect(signers[1]);

    const tier2Updated = {
      name: 'MemberV2',
      royaltyBasis: BigNumber.from(1200),
      salePrice: ethToWei(0.2),
      isTransferable: false,
    };

    const tier3Updated = {
      name: 'CreatorV2',
      royaltyBasis: BigNumber.from(1300),
      salePrice: ethToWei(0.3),
      isTransferable: false,
    };

    try {
      await nonAdmin.updateTiers([
        { tierId: 1, tierUpdates: tier2Updated },
        { tierId: 2, tierUpdates: tier3Updated },
      ]);
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }

    const contractTier1 = await instance1.tierInfo(0);
    const contractTier2 = await instance1.tierInfo(1);
    const contractTier3 = await instance1.tierInfo(2);

    expect(contractTier1).to.containSubset(tier1);
    expect(contractTier2).to.containSubset(tier2);
    expect(contractTier3).to.containSubset(tier3);
  });

  it('Updating non existent tier should revert', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    const tier1 = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(100),
      salePrice: ethToWei(1),
      isTransferable: false,
    };

    const tier2 = {
      name: 'Member',
      royaltyBasis: BigNumber.from(200),
      salePrice: ethToWei(2),
      isTransferable: true,
    };

    const tier3 = {
      name: 'Creator',
      royaltyBasis: BigNumber.from(300),
      salePrice: ethToWei(3),
      isTransferable: true,
    };

    await (await instance1.addTiers([tier1, tier2, tier3])).wait();

    expect((await instance1.totalTiers()).toNumber()).to.equal(3);

    const tier4Updated = {
      name: 'MemberV2',
      royaltyBasis: BigNumber.from(1200),
      salePrice: ethToWei(0.2),
      isTransferable: false,
    };

    try {
      await instance1.updateTiers([
        { tierId: 3, tierUpdates: tier4Updated },
      ]);
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Updating nonexistent tier\'');
    }

    const contractTier1 = await instance1.tierInfo(0);
    const contractTier2 = await instance1.tierInfo(1);
    const contractTier3 = await instance1.tierInfo(2);

    expect(contractTier1).to.containSubset(tier1);
    expect(contractTier2).to.containSubset(tier2);
    expect(contractTier3).to.containSubset(tier3);
  });

  it('Sets contractURI', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    expect(await instance1.contractURI()).to.equal('mockUri1');

    const nonAdmin = instance1.connect(signers[1]);

    try {
      await nonAdmin.setContractUri('NEWURI');
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }

    expect(await nonAdmin.contractURI()).to.equal('mockUri1');

    await (await instance1.setContractUri('NEWURI')).wait();

    expect(await instance1.contractURI()).to.equal('NEWURI');
  });

  it('Sets beneficiary', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    expect(await instance1.beneficiaryAddress()).to.equal(signers[0].address);

    const nonAdmin = instance1.connect(signers[1]);

    try {
      await nonAdmin.setBeneficiary(signers[1].address);
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }

    expect(await nonAdmin.beneficiaryAddress()).to.equal(signers[0].address);

    await (await instance1.setBeneficiary(signers[1].address)).wait();

    expect(await instance1.beneficiaryAddress()).to.equal(signers[1].address);
  });

  it('mintTo workflow', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);

    const tier1 = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(100),
      salePrice: ethToWei(1),
      isTransferable: false,
    };

    const tier2 = {
      name: 'Member',
      royaltyBasis: BigNumber.from(200),
      salePrice: ethToWei(2),
      isTransferable: true,
    };

    await (await instance1.addTiers([tier1, tier2])).wait();

    await (await instance1.mintTo(signers[1].address, 0, 'ipfs://123456789')).wait();

    expect((await instance1.totalSupply()).toNumber()).to.equal(1);
    expect((await instance1.tokenTiers(0))).to.equal(0);
    expect((await instance1.balanceOf(signers[1].address)).toNumber()).to.equal(1);
    expect(await instance1.tokenURI(0)).to.equal('ipfs://123456789');

    const [beneficiary, royalty] = await instance1.royaltyInfo(0, 1000);

    expect(beneficiary).to.equal(signers[0].address);
    expect(royalty.toNumber()).to.equal(10);

    await (await instance1.mintTo(signers[2].address, 1, 'ipfs://987654321')).wait();

    expect((await instance1.totalSupply()).toNumber()).to.equal(2);
    expect((await instance1.tokenTiers(1))).to.equal(1);
    expect((await instance1.balanceOf(signers[2].address)).toNumber()).to.equal(1);
    expect(await instance1.tokenURI(1)).to.equal('ipfs://987654321');

    const [beneficiary2, royalty2] = await instance1.royaltyInfo(1, 1000);

    expect(beneficiary2).to.equal(signers[0].address);
    expect(royalty2.toNumber()).to.equal(20);
  });

  it('mintTo reverts when called by non-admin', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    const nonAdmin = instance1.connect(signers[1]);

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);

    const tier1 = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(100),
      salePrice: ethToWei(1),
      isTransferable: false,
    };

    await (await instance1.addTiers([tier1])).wait();

    try {
      await nonAdmin.mintTo(signers[1].address, 0, 'ipfs://123456789');
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);
  });

  it('mintTo reverts when called with non existent tier', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);

    try {
      await instance1.mintTo(signers[1].address, 0, 'ipfs://123456789');
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Invalid tierId\'');
    }

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);
  });

  it('mintTo reverts when tokenUri is blank', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    const tier1 = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(100),
      salePrice: ethToWei(1),
      isTransferable: false,
    };

    await (await instance1.addTiers([tier1])).wait();

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);

    try {
      await instance1.mintTo(signers[1].address, 0, '');
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'tokenUri must be set\'');
    }

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);
  });

  it('Token transferability reflects tier configuration', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    const tier1 = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(100),
      salePrice: ethToWei(1),
      isTransferable: false,
    };

    await (await instance1.addTiers([tier1])).wait();

    await (await instance1.mintTo(signers[3].address, 0, 'tokenURI1')).wait();

    expect((await instance1.balanceOf(signers[3].address)).toNumber()).to.equal(1);
    expect((await instance1.balanceOf(signers[4].address)).toNumber()).to.equal(0);
    expect(await instance1.ownerOf(0)).to.equal(signers[3].address);

    const account3 = instance1.connect(signers[3]);

    try {
      await account3['safeTransferFrom(address,address,uint256)'](signers[3].address, signers[4].address, 0);
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'This token is non transferable\'');
    }

    await (await instance1.updateTiers([{
      tierId: 0,
      tierUpdates: {
        ...tier1,
        isTransferable: true,
      },
    }])).wait();

    await (await account3['safeTransferFrom(address,address,uint256)'](signers[3].address, signers[4].address, 0)).wait();

    expect((await instance1.balanceOf(signers[3].address)).toNumber()).to.equal(0);
    expect((await instance1.balanceOf(signers[4].address)).toNumber()).to.equal(1);
    expect(await instance1.ownerOf(0)).to.equal(signers[4].address);
  });

  it('Token are always transferable to and from admins', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    const tier1 = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(100),
      salePrice: ethToWei(1),
      isTransferable: false,
    };

    await (await instance1.addTiers([tier1])).wait();

    await (await instance1.mintTo(signers[3].address, 0, 'tokenURI1')).wait();

    expect((await instance1.balanceOf(signers[0].address)).toNumber()).to.equal(0);
    expect((await instance1.balanceOf(signers[3].address)).toNumber()).to.equal(1);
    expect(await instance1.ownerOf(0)).to.equal(signers[3].address);

    const account3 = instance1.connect(signers[3]);

    await (await account3['safeTransferFrom(address,address,uint256)'](signers[3].address, signers[0].address, 0)).wait();

    expect((await instance1.balanceOf(signers[3].address)).toNumber()).to.equal(0);
    expect((await instance1.balanceOf(signers[0].address)).toNumber()).to.equal(1);
    expect(await instance1.ownerOf(0)).to.equal(signers[0].address);

    await (await instance1['safeTransferFrom(address,address,uint256)'](signers[0].address, signers[4].address, 0)).wait();

    expect((await instance1.balanceOf(signers[0].address)).toNumber()).to.equal(0);
    expect((await instance1.balanceOf(signers[4].address)).toNumber()).to.equal(1);
    expect(await instance1.ownerOf(0)).to.equal(signers[4].address);
  });

  it('Minting succeeds with a valid voucher', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    const tier1 = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(100),
      salePrice: ethToWei(1),
      isTransferable: false,
    };

    await (await instance1.addTiers([tier1])).wait();

    const nonAdmin = instance1.connect(signers[1]);

    const signature = await ERC721MembershipV2Voucher({
      chainId: 31337,
      contractName: 'Mock1',
      contractAddress: instance1.address,
      wallet: signers[0],
      balance: 1,
      tierId: 0,
      minter: signers[1].address,
    });

    await (await nonAdmin.mint(signature, 'mockTokenURI', { value: ethToWei(1) })).wait();

    expect(await instance1.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await instance1.balanceOf(signers[1].address)).to.deep.equal(BigNumber.from(1));
    expect(await instance1.ownerOf(0)).to.equal(signers[1].address);
    expect(await instance1.tokenURI(0)).to.equal('mockTokenURI');
    expect((await instance1.tokenTiers(0))).to.equal(0);

    const [beneficiary, royalty] = await instance1.royaltyInfo(0, 1000);

    expect(beneficiary).to.equal(signers[0].address);
    expect(royalty.toNumber()).to.equal(10);
  });

  it('Minting fails without a valid voucher', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721MembershipV2Logic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721MembershipV2Logic.attach(address1);

    const tier1 = {
      name: 'Admin',
      royaltyBasis: BigNumber.from(100),
      salePrice: ethToWei(1),
      isTransferable: false,
    };

    await (await instance1.addTiers([tier1])).wait();

    const nonAdmin = instance1.connect(signers[1]);

    // Malformed signature
    try {
      const mintMalformedStructTx = await nonAdmin.mint({
        balance: 1,
        minter: signers[1].address,
        tierId: 0,
        signature: utils.toUtf8Bytes('0xmockSigntatureData'),
      }, 'https://mockToken.com', { value: ethToWei(1) });

      await mintMalformedStructTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'ECDSA: invalid signature length\'');
    }

    // Signed by non-admin
    try {
      const signature = await ERC721MembershipV2Voucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: nonAdmin.address,
        wallet: signers[1],
        balance: 1,
        tierId: 0,
        minter: signers[1].address,
      });
      const invalidSigTx = await nonAdmin.mint(signature, 'https://mockToken.com', { value: ethToWei(1) });
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Signature invalid\'');
    }

    // Valid signature but max balance reached
    try {
      const signature = await ERC721MembershipV2Voucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: nonAdmin.address,
        wallet: signers[0],
        balance: 0,
        tierId: 0,
        minter: signers[1].address,
      });
      const invalidSigTx = await nonAdmin.mint(signature, 'https://mockToken.com', { value: ethToWei(1) });
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Cannot mint any more tokens\'');
    }

    // Not sending enough crypto
    try {
      const signature = await ERC721MembershipV2Voucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: nonAdmin.address,
        wallet: signers[0],
        balance: 1,
        tierId: 0,
        minter: signers[1].address,
      });
      const invalidSigTx = await nonAdmin.mint(signature, 'https://mockToken.com', { value: ethToWei(0.5) });
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Value sent is too low\'');
    }

    // Valid signature but empty tokenUri
    try {
      const signature = await ERC721MembershipV2Voucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: nonAdmin.address,
        wallet: signers[0],
        balance: 0,
        tierId: 0,
        minter: signers[1].address,
      });
      const invalidSigTx = await nonAdmin.mint(signature, '', { value: ethToWei(1) });
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'tokenUri must be set\'');
    }

    // Valid signature but invalid tierId
    try {
      const signature = await ERC721MembershipV2Voucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: nonAdmin.address,
        wallet: signers[0],
        balance: 0,
        tierId: 1,
        minter: signers[1].address,
      });
      const invalidSigTx = await nonAdmin.mint(signature, 'https://mockToken.com', { value: ethToWei(1) });
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Invalid tierId\'');
    }
  });
});
