const { ethers } = require('hardhat');
const { expect } = require('chai');
const { utils } = require('ethers');
const { initializer } = require('../utils/contracts')[4];

const iface = new utils.Interface([initializer]);

describe('ERC721Art', () => {
  let signers;
  let ERC721ArtLogic;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    const logicFactory = await ethers.getContractFactory('ERC721Art');
    ERC721ArtLogic = await logicFactory.deploy();
    await ERC721ArtLogic.deployTransaction.wait();
  });

  it('Correctly deploys proxies', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address, 100,
      ]),
    );

    const proxy2 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock2', 'MCK2', 'mockUri2', signers[1].address, 200,
      ]),
    );

    const proxy3 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock3', 'MCK3', 'mockUri3', signers[2].address, 300,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();
    const { contractAddress: address2 } = await proxy2.deployTransaction.wait();
    const { contractAddress: address3 } = await proxy3.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);
    const instance2 = ERC721ArtLogic.attach(address2);
    const instance3 = ERC721ArtLogic.attach(address3);

    expect(await instance1.name()).to.equal('Mock1');
    expect(await instance2.name()).to.equal('Mock2');
    expect(await instance3.name()).to.equal('Mock3');
    expect(await instance1.symbol()).to.equal('MCK1');
    expect(await instance2.symbol()).to.equal('MCK2');
    expect(await instance3.symbol()).to.equal('MCK3');
    expect(await instance1.contractURI()).to.equal('mockUri1');
    expect(await instance2.contractURI()).to.equal('mockUri2');
    expect(await instance3.contractURI()).to.equal('mockUri3');

    const [beneficiary1, royalty1] = await instance1.royaltyInfo(0, 1000);
    const [beneficiary2, royalty2] = await instance2.royaltyInfo(0, 1000);
    const [beneficiary3, royalty3] = await instance3.royaltyInfo(0, 1000);

    expect(beneficiary1).to.equal(signers[0].address);
    expect(beneficiary2).to.equal(signers[1].address);
    expect(beneficiary3).to.equal(signers[2].address);
    expect(royalty1.toNumber()).to.equal(10);
    expect(royalty2.toNumber()).to.equal(20);
    expect(royalty3.toNumber()).to.equal(30);
  });

  it('Minting fails without minter role', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');

    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address, 100,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();
    const instance1 = ERC721ArtLogic.attach(address1);

    try {
      await instance1.mint(signers[0].address, 'mockUri');
      expect(false).to.equal(true);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }
  });

  it('Minting succeeds with correct role', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');

    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address, 100,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();
    const instance1 = ERC721ArtLogic.attach(address1);

    await (await instance1.grantRole('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', signers[0].address)).wait();
    await (await instance1.mint(signers[0].address, 'mockUri')).wait();

    expect(await instance1.ownerOf(0)).to.equal(signers[0].address);
    expect((await instance1.balanceOf(signers[0].address)).toNumber()).to.equal(1);
    expect(await instance1.tokenURI(0)).to.equal('mockUri');
  });

  it('Minting succeeds with correct role then fails when role is revoked', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');

    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address, 100,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();
    const instance1 = ERC721ArtLogic.attach(address1);

    await (await instance1.grantRole('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', signers[0].address)).wait();
    await (await instance1.mint(signers[0].address, 'mockUri')).wait();

    expect(await instance1.ownerOf(0)).to.equal(signers[0].address);
    expect((await instance1.balanceOf(signers[0].address)).toNumber()).to.equal(1);
    expect(await instance1.tokenURI(0)).to.equal('mockUri');

    await (await instance1.revokeRole('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', signers[0].address)).wait();

    try {
      await instance1.mint(signers[0].address, 'mockUri2');
      expect(false).to.equal(true);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }
  });

  it('It sets contractUri', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');

    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address, 100,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();
    const instance1 = ERC721ArtLogic.attach(address1);

    expect(await instance1.contractURI()).to.equal('mockUri1');

    await (await instance1.setContractUri('newURI')).wait();

    expect(await instance1.contractURI()).to.equal('newURI');

    const nonAdmin = instance1.connect(signers[1]);

    try {
      await (await nonAdmin.setContractUri('newURI2')).wait();
      expect(false).to.equal(true);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('It sets defaultRoyalty', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');

    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address, 100,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();
    const instance1 = ERC721ArtLogic.attach(address1);

    const [beneficiary1, royalty1] = await instance1.royaltyInfo(0, 1000);
    expect(beneficiary1).to.equal(signers[0].address);
    expect(royalty1.toNumber()).to.equal(10);

    await (await instance1['setRoyalty(address,uint96)'](signers[1].address, 500)).wait();

    const [beneficiary2, royalty2] = await instance1.royaltyInfo(0, 1000);
    expect(beneficiary2).to.equal(signers[1].address);
    expect(royalty2.toNumber()).to.equal(50);

    const nonAdmin = instance1.connect(signers[1]);

    try {
      await (await nonAdmin['setRoyalty(address,uint96)'](signers[2].address, 1000)).wait();
      expect(false).to.equal(true);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('It sets tokenRoyalty', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');

    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address, 100,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();
    const instance1 = ERC721ArtLogic.attach(address1);

    const [beneficiary1, royalty1] = await instance1.royaltyInfo(0, 1000);
    expect(beneficiary1).to.equal(signers[0].address);
    expect(royalty1.toNumber()).to.equal(10);

    await (await instance1['setRoyalty(uint256,address,uint96)'](0, signers[1].address, 500)).wait();

    const [beneficiary2, royalty2] = await instance1.royaltyInfo(0, 1000);
    expect(beneficiary2).to.equal(signers[1].address);
    expect(royalty2.toNumber()).to.equal(50);

    const nonAdmin = instance1.connect(signers[1]);

    try {
      await (await nonAdmin['setRoyalty(uint256,address,uint96)'](0, signers[2].address, 1000)).wait();
      expect(false).to.equal(true);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });
});
