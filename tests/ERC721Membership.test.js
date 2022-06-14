const { ethers } = require('hardhat');
const { expect } = require('chai');
const { BigNumber, utils } = require('ethers');
const { ERC721MembershipV1Voucher } = require('../utils/signatures');

describe('ERC721MembershipV1', () => {
  let ERC721Whitelisted;

  beforeEach(async () => {
    const factory = await ethers.getContractFactory('ERC721MembershipV1');

    ERC721Whitelisted = await factory.deploy(
      'MockNFT',
      'MNFT',
      'ipfs://mock12345',
      '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    );
  });

  it('Correctly deploys with constructor params', async () => {
    expect(await ERC721Whitelisted.name()).to.equal('MockNFT');
    expect(await ERC721Whitelisted.symbol()).to.equal('MNFT');
    expect(await ERC721Whitelisted.contractURI()).to.equal('ipfs://mock12345');
    expect((await ERC721Whitelisted.beneficiaryAddress())
      .toLowerCase())
      .to.equal('0x70997970c51812dc3a010c7d01b50e0d17dc79c8'.toLowerCase());
  });

  it('Correctly sets contractURI', async () => {
    const tx = await ERC721Whitelisted.setContractUri('mockSetUri');
    await tx.wait();

    expect(await ERC721Whitelisted.contractURI()).to.deep.equal('mockSetUri');
  });

  it('Throws when a non-admin calls setContractUri', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.setContractUri('mockSetUri');
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('Correctly sets baseUri', async () => {
    const tx = await ERC721Whitelisted.setBaseUri('mockSetUri');
    await tx.wait();

    expect(await ERC721Whitelisted.baseURI()).to.deep.equal('mockSetUri');
  });

  it('Throws when a non-admin calls setBaseUri', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.setBaseUri('mockSetUri');
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('Correctly sets beneficiary', async () => {
    const signers = await ethers.getSigners();

    const tx = await ERC721Whitelisted.setBeneficiary(signers[1].address);
    await tx.wait();

    expect(await ERC721Whitelisted.beneficiaryAddress())
      .to.deep.equal(signers[1].address);
  });

  it('Throws when a non-admin calls setBeneficiary', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.setBeneficiary(signers[1].address);
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('Initially returns 0 for royalty', async () => {
    const [reciever, royaltyAmount] = await ERC721Whitelisted.royaltyInfo(5, 100);
    expect(reciever.toLowerCase()).to.equal('0x70997970c51812dc3a010c7d01b50e0d17dc79c8'.toLowerCase());
    expect(royaltyAmount.toNumber()).to.equal(0);
  });

  it('Correctly sets royaltyBasis', async () => {
    const tx = await ERC721Whitelisted.setRoyalty(500);
    await tx.wait();

    const [reciever, royaltyAmount] = await ERC721Whitelisted.royaltyInfo(5, 100);

    expect(reciever.toLowerCase()).to.equal('0x70997970c51812dc3a010c7d01b50e0d17dc79c8'.toLowerCase());
    expect(royaltyAmount.toNumber()).to.equal(5);
  });

  it('Throws when a non-admin calls setRoyalty', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.setRoyalty(500);
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('Correctly mints a token with mintTo', async () => {
    const signers = await ethers.getSigners();
    const balance = await ERC721Whitelisted.totalSupply();
    expect(balance).to.deep.equal(BigNumber.from(0));

    const tx = await ERC721Whitelisted.mintTo(signers[1].address, 'http://mockURI.com');
    await tx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.balanceOf(signers[1].address)).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.tokenURI(0)).to.equal('http://mockURI.com');
  });

  it('Correctly mints a token with mintTo when tokenUri is excluded', async () => {
    const signers = await ethers.getSigners();
    const balance = await ERC721Whitelisted.totalSupply();
    expect(balance).to.deep.equal(BigNumber.from(0));

    await ERC721Whitelisted.setBaseUri('ipfs://mockNFTdirectory/');
    const tx = await ERC721Whitelisted.mintTo(signers[1].address, '');
    await tx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.balanceOf(signers[1].address)).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.tokenURI(0)).to.equal('ipfs://mockNFTdirectory/0');
  });

  it('Fails when mintTo is called by a non-minter role', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }
  });

  it('Correctly grants role and then mints a new token', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }

    const minterRole = utils.keccak256(utils.toUtf8Bytes('MINTER_ROLE'));
    const tx = await ERC721Whitelisted.grantRole(minterRole, signers[1].address);
    await tx.wait();

    const mintTx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
    await mintTx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.balanceOf(signers[2].address)).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[2].address);
    expect(await ERC721Whitelisted.tokenURI(0)).to.equal('http://mockURI.com');
  });

  it('Correctly revokes role and then fails a token mint', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }

    const minterRole = utils.keccak256(utils.toUtf8Bytes('MINTER_ROLE'));
    const tx = await ERC721Whitelisted.grantRole(minterRole, signers[1].address);
    await tx.wait();

    const mintTx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
    await mintTx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.balanceOf(signers[2].address)).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[2].address);
    expect(await ERC721Whitelisted.tokenURI(0)).to.equal('http://mockURI.com');

    const revokeTx = await ERC721Whitelisted.revokeRole(minterRole, signers[1].address);
    await revokeTx.wait();

    try {
      const secondMintTx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
      await secondMintTx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }
  });

  it('Correctly transfers ownership and then allows changing salePrice', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.setBeneficiary(signers[1].address);
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }

    expect(await nonAdmin.beneficiaryAddress()).to.equal(signers[1].address);

    const transferTx = await ERC721Whitelisted.transferOwnership(signers[1].address);
    await transferTx.wait();

    const setBeneficiaryTx = await nonAdmin.setBeneficiary(signers[3].address);
    await setBeneficiaryTx.wait();

    expect(await nonAdmin.beneficiaryAddress()).to.equal(signers[3].address);
  });

  it('Throws when given an invalid mint voucher', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    // Malformed signature
    try {
      const mintMalformedStructTx = await nonAdmin.mint({
        balance: 1,
        minter: signers[1].address,
        salePrice: 0,
        signature: utils.toUtf8Bytes('0xmockSigntatureData'),
      }, 'https://mockToken.com');

      await mintMalformedStructTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'ECDSA: invalid signature length\'');
    }

    // Signed by non-admin
    try {
      const signature = await ERC721MembershipV1Voucher({
        chainId: 31337,
        contractName: 'MockNFT',
        contractAddress: nonAdmin.address,
        wallet: signers[1],
        balance: 1,
        salePrice: 0,
        minter: signers[1].address,
      });
      const invalidSigTx = await nonAdmin.mint(signature, 'https://mockToken.com');
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Signature invalid\'');
    }

    // Valid signature but max balance reached
    try {
      const signature = await ERC721MembershipV1Voucher({
        chainId: 31337,
        contractName: 'MockNFT',
        contractAddress: nonAdmin.address,
        wallet: signers[0],
        balance: 0,
        salePrice: 0,
        minter: signers[1].address,
      });
      const invalidSigTx = await nonAdmin.mint(signature, 'https://mockToken.com');
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Cannot mint any more tokens\'');
    }

    // Not sending enough crypto
    try {
      const signature = await ERC721MembershipV1Voucher({
        chainId: 31337,
        contractName: 'MockNFT',
        contractAddress: nonAdmin.address,
        wallet: signers[0],
        balance: 1,
        salePrice: 0.5,
        minter: signers[1].address,
      });
      const invalidSigTx = await nonAdmin.mint(signature, 'https://mockToken.com', { value: BigNumber.from('50000000000000000') });
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Value sent is too low\'');
    }
  });

  it('Correctly allows minting by a non-minter role with a valid mint voucher', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    const signature = await ERC721MembershipV1Voucher({
      chainId: 31337,
      contractName: 'MockNFT',
      contractAddress: nonAdmin.address,
      wallet: signers[0],
      balance: 1,
      salePrice: 0.005,
      minter: signers[1].address,
    });

    const invalidSigTx = await nonAdmin.mint(signature, 'https://mockToken.com', { value: BigNumber.from('50000000000000000') });
    await invalidSigTx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.balanceOf(signers[1].address)).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.tokenURI(0)).to.equal('https://mockToken.com');
  });

  it('Correctly mints with a valid mintVoucher and no tokenURI', async () => {
    const signers = await ethers.getSigners();

    const admin = ERC721Whitelisted.connect(signers[0]);

    await admin.setBaseUri('ipfs://mockNFT/');

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    const signature = await ERC721MembershipV1Voucher({
      chainId: 31337,
      contractName: 'MockNFT',
      contractAddress: nonAdmin.address,
      wallet: signers[0],
      balance: 1,
      salePrice: 0.005,
      minter: signers[1].address,
    });

    const invalidSigTx = await nonAdmin.mint(signature, '', { value: BigNumber.from('50000000000000000') });
    await invalidSigTx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.balanceOf(signers[1].address)).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.tokenURI(0)).to.equal('ipfs://mockNFT/0');
  });

  it('Correctly sets isTransferrable to true by default', async () => {
    const isTransferable = await ERC721Whitelisted.isTransferrable();
    expect(isTransferable).to.equal(true);
  });

  it('Mint and transferFrom workflow when isTransferrable==true', async () => {
    const signers = await ethers.getSigners();
    const from = signers[1];
    const to = signers[2];

    const tx = await ERC721Whitelisted.mintTo(signers[1].address, 'http://mockURI.com');
    await tx.wait();

    expect((await ERC721Whitelisted.balanceOf(from.address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(to.address)).toNumber()).to.equal(0);

    const transferTx = await ERC721Whitelisted.connect(from).transferFrom(
      signers[1].address,
      signers[2].address,
      0,
    );
    await transferTx.wait();

    expect((await ERC721Whitelisted.balanceOf(from.address)).toNumber()).to.equal(0);
    expect((await ERC721Whitelisted.balanceOf(to.address)).toNumber()).to.equal(1);
  });

  it('Mint and transferFrom workflow when isTransferrable==false', async () => {
    const signers = await ethers.getSigners();
    const from = signers[1];
    const to = signers[2];

    const setTransferTx = await ERC721Whitelisted.setIsTransferrable(false);
    await setTransferTx.wait();

    const mintTx = await ERC721Whitelisted.mintTo(signers[1].address, 'http://mockURI.com');
    await mintTx.wait();

    expect((await ERC721Whitelisted.balanceOf(from.address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(to.address)).toNumber()).to.equal(0);

    try {
      const transferTx = await ERC721Whitelisted.connect(from).transferFrom(
        signers[1].address,
        signers[2].address,
        0,
      );
      await transferTx.wait();
      expect(true).to.be(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'This NFT is non transferrable\'');
    }
  });

  it('Admin Mint and transferFrom workflow when isTransferrable==false', async () => {
    const signers = await ethers.getSigners();

    // Disable transfers
    const setTransferTx = await ERC721Whitelisted.setIsTransferrable(false);
    await setTransferTx.wait();

    // Mint a token to an admin account
    const mintTx = await ERC721Whitelisted.mintTo(signers[0].address, 'http://mockURI.com');
    await mintTx.wait();

    // Mint a token to a non-admin
    const mint2Tx = await await ERC721Whitelisted.mintTo(signers[2].address, 'http://mockURI.com');
    await mint2Tx.wait();

    // Sanity checks
    expect((await ERC721Whitelisted.balanceOf(signers[0].address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(signers[1].address)).toNumber()).to.equal(0);
    expect((await ERC721Whitelisted.balanceOf(signers[2].address)).toNumber()).to.equal(1);

    // Test transfer where 'from' == admin
    const transferTx = await ERC721Whitelisted.transferFrom(
      signers[0].address,
      signers[1].address,
      0,
    );
    await transferTx.wait();
    expect((await ERC721Whitelisted.balanceOf(signers[0].address)).toNumber()).to.equal(0);
    expect((await ERC721Whitelisted.balanceOf(signers[1].address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(signers[2].address)).toNumber()).to.equal(1);

    // Test transfer where 'to' == admin
    const transfer2Tx = await ERC721Whitelisted.connect(signers[2]).transferFrom(
      signers[2].address,
      signers[0].address,
      1,
    );
    await transfer2Tx.wait();
    expect((await ERC721Whitelisted.balanceOf(signers[0].address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(signers[1].address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(signers[2].address)).toNumber()).to.equal(0);
  });

  it('Mint and safeTransferFrom workflow when isTransferrable==true', async () => {
    const signers = await ethers.getSigners();
    const from = signers[1];
    const to = signers[2];

    const tx = await ERC721Whitelisted.mintTo(signers[1].address, 'http://mockURI.com');
    await tx.wait();

    expect((await ERC721Whitelisted.balanceOf(from.address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(to.address)).toNumber()).to.equal(0);

    const transferTx = await ERC721Whitelisted.connect(from)['safeTransferFrom(address,address,uint256)'](
      signers[1].address,
      signers[2].address,
      0,
    );
    await transferTx.wait();

    expect((await ERC721Whitelisted.balanceOf(from.address)).toNumber()).to.equal(0);
    expect((await ERC721Whitelisted.balanceOf(to.address)).toNumber()).to.equal(1);
  });

  it('Mint and safeTransferFrom workflow when isTransferrable==false', async () => {
    const signers = await ethers.getSigners();
    const from = signers[1];
    const to = signers[2];

    const setTransferTx = await ERC721Whitelisted.setIsTransferrable(false);
    await setTransferTx.wait();

    const mintTx = await ERC721Whitelisted.mintTo(signers[1].address, 'http://mockURI.com');
    await mintTx.wait();

    expect((await ERC721Whitelisted.balanceOf(from.address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(to.address)).toNumber()).to.equal(0);

    try {
      const transferTx = await ERC721Whitelisted.connect(from)['safeTransferFrom(address,address,uint256)'](
        signers[1].address,
        signers[2].address,
        0,
      );
      await transferTx.wait();
      expect(true).to.be(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'This NFT is non transferrable\'');
    }
  });

  it('Admin Mint and safeTransferFrom workflow when isTransferrable==false', async () => {
    const signers = await ethers.getSigners();

    // Disable transfers
    const setTransferTx = await ERC721Whitelisted.setIsTransferrable(false);
    await setTransferTx.wait();

    // Mint a token to an admin account
    const mintTx = await ERC721Whitelisted.mintTo(signers[0].address, 'http://mockURI.com');
    await mintTx.wait();

    // Mint a token to a non-admin
    const mint2Tx = await await ERC721Whitelisted.mintTo(signers[2].address, 'http://mockURI.com');
    await mint2Tx.wait();

    // Sanity checks
    expect((await ERC721Whitelisted.balanceOf(signers[0].address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(signers[1].address)).toNumber()).to.equal(0);
    expect((await ERC721Whitelisted.balanceOf(signers[2].address)).toNumber()).to.equal(1);

    // Test transfer where 'from' == admin
    const transferTx = await ERC721Whitelisted['safeTransferFrom(address,address,uint256)'](
      signers[0].address,
      signers[1].address,
      0,
    );
    await transferTx.wait();
    expect((await ERC721Whitelisted.balanceOf(signers[0].address)).toNumber()).to.equal(0);
    expect((await ERC721Whitelisted.balanceOf(signers[1].address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(signers[2].address)).toNumber()).to.equal(1);

    // Test transfer where 'to' == admin
    const transfer2Tx = await ERC721Whitelisted.connect(signers[2])['safeTransferFrom(address,address,uint256)'](
      signers[2].address,
      signers[0].address,
      1,
    );
    await transfer2Tx.wait();
    expect((await ERC721Whitelisted.balanceOf(signers[0].address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(signers[1].address)).toNumber()).to.equal(1);
    expect((await ERC721Whitelisted.balanceOf(signers[2].address)).toNumber()).to.equal(0);
  });
});
