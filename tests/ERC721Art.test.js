const { ethers } = require('hardhat');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const { utils, BigNumber } = require('ethers');
const { ethToWei } = require('../utils/conversions');
const { ERC721ArtVoucher } = require('../utils/signatures');
const { initializer } = require('../utils/contracts')[3];

chai.use(chaiSubset);
const { expect } = chai;

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
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const proxy2 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock2', 'MCK2', 'mockUri2', signers[1].address,
      ]),
    );

    const proxy3 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock3', 'MCK3', 'mockUri3', signers[2].address,
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

  it('Sets contractURI', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

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
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

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

  it('Sets royalty', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    expect(await instance1.beneficiaryAddress()).to.equal(signers[0].address);

    const nonAdmin = instance1.connect(signers[1]);

    try {
      await nonAdmin.setRoyalty(500);
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }

    expect(await nonAdmin.royaltyBasis()).to.deep.equal(BigNumber.from(0));

    await (await instance1.setRoyalty(500)).wait();

    expect(await instance1.royaltyBasis()).to.deep.equal(BigNumber.from(500));
  });

  it('Sets salePrice', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    expect(await instance1.beneficiaryAddress()).to.equal(signers[0].address);

    const nonAdmin = instance1.connect(signers[1]);

    try {
      await nonAdmin.setSalePrice(500);
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }

    expect(await nonAdmin.salePrice()).to.deep.equal(BigNumber.from(0));

    await (await instance1.setSalePrice(500)).wait();

    expect(await instance1.salePrice()).to.deep.equal(BigNumber.from(500));
  });

  it('mintTo workflow', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);

    await (await instance1.setRoyalty(1000)).wait();

    await (await instance1.mintTo(signers[1].address, 1, 'ipfs://123456789')).wait();

    expect((await instance1.totalSupply()).toNumber()).to.equal(1);
    expect((await instance1.balanceOf(signers[1].address)).toNumber()).to.equal(1);
    expect(await instance1.tokenURI(1)).to.equal('ipfs://123456789');

    const [beneficiary, royalty] = await instance1.royaltyInfo(0, 1000);

    expect(beneficiary).to.equal(signers[0].address);
    expect(royalty.toNumber()).to.equal(100);

    await (await instance1.mintTo(signers[2].address, 2, 'ipfs://987654321')).wait();

    expect((await instance1.totalSupply()).toNumber()).to.equal(2);
    expect((await instance1.balanceOf(signers[2].address)).toNumber()).to.equal(1);
    expect(await instance1.tokenURI(2)).to.equal('ipfs://987654321');

    const [beneficiary2, royalty2] = await instance1.royaltyInfo(1, 2000);

    expect(beneficiary2).to.equal(signers[0].address);
    expect(royalty2.toNumber()).to.equal(200);
  });

  it('batchMintTo workflow', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);

    await (await instance1.setRoyalty(1000)).wait();

    const payloads = [];
    for (let x = 0; x < 50; x += 1) {
      /* eslint-disable no-await-in-loop */
      const payload = {
        to: signers[1].address,
        tokenId: x,
        tokenUri: 'ipfs://123456789',
      };

      payloads.push(payload);
    }

    await (await instance1.batchMintTo(payloads)).wait();

    expect((await instance1.totalSupply()).toNumber()).to.equal(50);
    expect((await instance1.balanceOf(signers[1].address)).toNumber()).to.equal(50);
    expect(await instance1.tokenURI(0)).to.equal('ipfs://123456789');

    const [beneficiary, royalty] = await instance1.royaltyInfo(0, 1000);

    expect(beneficiary).to.equal(signers[0].address);
    expect(royalty.toNumber()).to.equal(100);

    await (await instance1.batchMintTo([{ to: signers[2].address, tokenId: 51, tokenUri: 'ipfs://987654321' }])).wait();

    expect((await instance1.totalSupply()).toNumber()).to.equal(51);
    expect((await instance1.balanceOf(signers[2].address)).toNumber()).to.equal(1);
    expect(await instance1.tokenURI(51)).to.equal('ipfs://987654321');

    const [beneficiary2, royalty2] = await instance1.royaltyInfo(1, 2000);

    expect(beneficiary2).to.equal(signers[0].address);
    expect(royalty2.toNumber()).to.equal(200);
  });

  it('mintTo reverts when called by non-admin', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    const nonAdmin = instance1.connect(signers[1]);

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);

    try {
      await nonAdmin.mintTo(signers[1].address, 0, 'ipfs://123456789');
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);
  });

  it('mintTo reverts when tokenUri is blank', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);

    try {
      await instance1.mintTo(signers[1].address, 0, '');
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'tokenUri must be set\'');
    }

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);
  });

  it('Cannot mint same tokenId twice', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    expect((await instance1.totalSupply()).toNumber()).to.equal(0);

    await (await instance1.setRoyalty(100)).wait();

    await (await instance1.mintTo(signers[1].address, 0, 'ipfs://123456789')).wait();

    expect((await instance1.totalSupply()).toNumber()).to.equal(1);
    expect((await instance1.balanceOf(signers[1].address)).toNumber()).to.equal(1);
    expect(await instance1.tokenURI(0)).to.equal('ipfs://123456789');

    const [beneficiary, royalty] = await instance1.royaltyInfo(0, 1000);

    expect(beneficiary).to.equal(signers[0].address);
    expect(royalty.toNumber()).to.equal(10);

    try {
      await instance1.mintTo(signers[1].address, 0, 'https://tokenUri');
      expect(true).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('VM Exception while processing transaction: reverted with reason string \'ERC721: token already minted\'');
    }

    expect((await instance1.totalSupply()).toNumber()).to.equal(1);
  });

  it('Tokens are always transferable', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    await (await instance1.mintTo(signers[3].address, 0, 'https://tokenURI1')).wait();

    expect((await instance1.balanceOf(signers[3].address)).toNumber()).to.equal(1);
    expect((await instance1.balanceOf(signers[4].address)).toNumber()).to.equal(0);
    expect(await instance1.ownerOf(0)).to.equal(signers[3].address);

    const account3 = instance1.connect(signers[3]);

    await (await account3['safeTransferFrom(address,address,uint256)'](signers[3].address, signers[4].address, 0)).wait();

    expect((await instance1.balanceOf(signers[3].address)).toNumber()).to.equal(0);
    expect((await instance1.balanceOf(signers[4].address)).toNumber()).to.equal(1);
    expect(await instance1.ownerOf(0)).to.equal(signers[4].address);
  });

  it('Minting succeeds with a valid voucher', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    await (await instance1.setSalePrice(ethToWei(1))).wait();
    await (await instance1.setRoyalty(100)).wait();

    const nonAdmin = instance1.connect(signers[1]);

    const signature = await ERC721ArtVoucher({
      chainId: 31337,
      contractName: 'Mock1',
      contractAddress: instance1.address,
      wallet: signers[0],
      tokenId: 0,
      minter: signers[1].address,
      tokenUri: 'mockTokenURI',
    });

    await (await nonAdmin.mint(signature, { value: ethToWei(1) })).wait();

    expect(await instance1.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await instance1.balanceOf(signers[1].address)).to.deep.equal(BigNumber.from(1));
    expect(await instance1.ownerOf(0)).to.equal(signers[1].address);
    expect(await instance1.tokenURI(0)).to.equal('mockTokenURI');

    const [beneficiary, royalty] = await instance1.royaltyInfo(0, 1000);

    expect(beneficiary).to.equal(signers[0].address);
    expect(royalty.toNumber()).to.equal(10);
  });

  it('Minting fails without a valid voucher', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    await (await instance1.setSalePrice(ethToWei(1))).wait();

    const nonAdmin = instance1.connect(signers[1]);

    // Malformed signature
    try {
      const mintMalformedStructTx = await nonAdmin.mint({
        tokenId: 1,
        minter: signers[1].address,
        tierId: 0,
        tokenUri: 'https://mockToken.com',
        signature: utils.toUtf8Bytes('0xmockSigntatureData'),
      }, { value: ethToWei(1) });

      await mintMalformedStructTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'ECDSA: invalid signature length\'');
    }

    // Signed by non-admin
    try {
      const signature = await ERC721ArtVoucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: nonAdmin.address,
        wallet: signers[1],
        tokenId: 0,
        minter: signers[1].address,
        tokenUri: 'https://mockToken.com',
      });
      const invalidSigTx = await nonAdmin.mint(signature, { value: ethToWei(1) });
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Signature invalid\'');
    }

    // Valid signature but tokenId already exists
    await (await instance1.mintTo(signers[1].address, 0, 'ipfs://123456789')).wait();
    try {
      const signature = await ERC721ArtVoucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: nonAdmin.address,
        wallet: signers[0],
        tokenId: 0,
        minter: signers[1].address,
        tokenUri: 'https://mockToken.com',
      });
      const invalidSigTx = await nonAdmin.mint(signature, { value: ethToWei(1) });
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'ERC721: token already minted\'');
    }

    // Not sending enough crypto
    try {
      const signature = await ERC721ArtVoucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: nonAdmin.address,
        wallet: signers[0],
        tokenId: 1,
        minter: signers[1].address,
        tokenUri: 'https://mockToken.com',
      });
      const invalidSigTx = await nonAdmin.mint(signature, { value: ethToWei(0.5) });
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Value sent is not correct\'');
    }

    // Valid signature but empty tokenUri
    try {
      const signature = await ERC721ArtVoucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: nonAdmin.address,
        wallet: signers[0],
        tokenId: 1,
        minter: signers[1].address,
        tokenUri: '',
      });
      const invalidSigTx = await nonAdmin.mint(signature, { value: ethToWei(1) });
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'tokenUri must be set\'');
    }
  });

  it('Batch minting succeeds when all vouchers are valid', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    await (await instance1.setSalePrice(ethToWei(1))).wait();
    await (await instance1.setRoyalty(100)).wait();

    const nonAdmin = instance1.connect(signers[1]);

    const vouchers = [];
    for (let x = 0; x < 50; x += 1) {
      /* eslint-disable no-await-in-loop */
      const voucher = await ERC721ArtVoucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: instance1.address,
        wallet: signers[0],
        tokenId: x,
        minter: signers[1].address,
        tokenUri: 'mockTokenURI',
      });

      vouchers.push(voucher);
    }

    await (await nonAdmin.batchMint(vouchers, { value: ethToWei(50) })).wait();

    expect(await instance1.totalSupply()).to.deep.equal(BigNumber.from(50));
    expect(await instance1.balanceOf(signers[1].address)).to.deep.equal(BigNumber.from(50));
    expect(await instance1.ownerOf(0)).to.equal(signers[1].address);
    expect(await instance1.tokenURI(0)).to.equal('mockTokenURI');

    const [beneficiary, royalty] = await instance1.royaltyInfo(0, 1000);

    expect(beneficiary).to.equal(signers[0].address);
    expect(royalty.toNumber()).to.equal(10);
  });

  it('Batch minting fails when there are more then 50 tokens', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    await (await instance1.setSalePrice(ethToWei(1))).wait();
    await (await instance1.setRoyalty(100)).wait();

    const nonAdmin = instance1.connect(signers[1]);

    const vouchers = [];
    for (let x = 0; x < 55; x += 1) {
      /* eslint-disable no-await-in-loop */
      const voucher = await ERC721ArtVoucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: instance1.address,
        wallet: signers[0],
        tokenId: x,
        minter: signers[1].address,
        tokenUri: 'mockTokenURI',
      });

      vouchers.push(voucher);
    }

    try {
      await (await nonAdmin.batchMint(vouchers, { value: ethToWei(50) })).wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Cannot mint more than 50 tokens\'');
    }

    expect(await instance1.totalSupply()).to.deep.equal(BigNumber.from(0));
    expect(await instance1.balanceOf(signers[1].address)).to.deep.equal(BigNumber.from(0));
  });

  it('Batch minting fails when there is not enough value sent', async () => {
    const storageFactory = await ethers.getContractFactory('ZKProxy');
    const proxy1 = await storageFactory.deploy(
      ERC721ArtLogic.address,
      iface.encodeFunctionData('initialize', [
        'Mock1', 'MCK1', 'mockUri1', signers[0].address,
      ]),
    );

    const { contractAddress: address1 } = await proxy1.deployTransaction.wait();

    const instance1 = ERC721ArtLogic.attach(address1);

    await (await instance1.setSalePrice(ethToWei(1))).wait();
    await (await instance1.setRoyalty(100)).wait();

    const nonAdmin = instance1.connect(signers[1]);

    const vouchers = [];
    for (let x = 0; x < 50; x += 1) {
      /* eslint-disable no-await-in-loop */
      const voucher = await ERC721ArtVoucher({
        chainId: 31337,
        contractName: 'Mock1',
        contractAddress: instance1.address,
        wallet: signers[0],
        tokenId: x,
        minter: signers[1].address,
        tokenUri: 'mockTokenURI',
      });

      vouchers.push(voucher);
    }

    try {
      await (await nonAdmin.batchMint(vouchers, { value: ethToWei(49) })).wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Value sent is not correct\'');
    }

    expect(await instance1.totalSupply()).to.deep.equal(BigNumber.from(0));
    expect(await instance1.balanceOf(signers[1].address)).to.deep.equal(BigNumber.from(0));
  });
});
