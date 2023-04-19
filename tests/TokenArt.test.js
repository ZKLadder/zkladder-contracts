const { ethers } = require('hardhat');
const { expect } = require('chai');
const { BigNumber } = require('ethers');

describe('TokenArt', () => {
  let ERC721Whitelisted;
  let tokenURIContract;

  beforeEach(async () => {
    const factory = await ethers.getContractFactory('TokenArt');
    const tokenURIFactory = await ethers.getContractFactory('TokenURI');

    ERC721Whitelisted = await factory.deploy(
      'ipfs://mock12345',
    );

    tokenURIContract = await tokenURIFactory.deploy();
  });

  it('Correctly deploys with constructor params', async () => {
    expect(await ERC721Whitelisted.name()).to.equal('Token Art Art Tokens');
    expect(await ERC721Whitelisted.symbol()).to.equal('TOKEN');
    expect(await ERC721Whitelisted.contractURI()).to.equal('ipfs://mock12345');
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

  it('Correctly sets tokenURIContract', async () => {
    const tx = await ERC721Whitelisted.setTokenURIContract(tokenURIContract.address);
    await tx.wait();
  });

  it('Throws when a non-admin calls setTokenURIContract', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.setTokenURIContract(tokenURIContract.address);
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('Correctly sets royaltyBasis', async () => {
    const tx = await ERC721Whitelisted.setTokenURIContract(tokenURIContract.address);
    await tx.wait();

    expect(await ERC721Whitelisted.royaltyInfo(101, 10000)).to.deep.equal(
      [tokenURIContract.address, BigNumber.from(500)],
    );

    const royaltyTx = await ERC721Whitelisted.setRoyaltyBasis(5000);
    await royaltyTx.wait();

    expect(await ERC721Whitelisted.royaltyInfo(101, 10000)).to.deep.equal(
      [tokenURIContract.address, BigNumber.from(5000)],
    );
  });

  it('Throws when a non-admin calls setRoyaltyBasis', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.setRoyaltyBasis(5000);
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('Correctly batchMints 300 tokens', async () => {
    const signers = await ethers.getSigners();
    const balance = await ERC721Whitelisted.totalSupply();
    expect(balance).to.deep.equal(BigNumber.from(0));

    const tokenUriContractTx = await ERC721Whitelisted.setTokenURIContract(
      tokenURIContract.address,
    );
    await tokenUriContractTx.wait();

    const tx = await ERC721Whitelisted.batchMintTo(signers[1].address, 300);
    await tx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(300));
    expect(await ERC721Whitelisted.balanceOf(
      signers[1].address,
    )).to.deep.equal(BigNumber.from(300));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.ownerOf(10)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.ownerOf(25)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.ownerOf(49)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.ownerOf(247)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.tokenURI(0)).to.equal('TOKENURI/0');
    expect(await ERC721Whitelisted.tokenURI(10)).to.equal('TOKENURI/10');
    expect(await ERC721Whitelisted.tokenURI(25)).to.equal('TOKENURI/25');
    expect(await ERC721Whitelisted.tokenURI(49)).to.equal('TOKENURI/49');
    expect(await ERC721Whitelisted.tokenURI(247)).to.equal('TOKENURI/247');

    try {
      await ERC721Whitelisted.tokenURI(300);
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('call revert exception; VM Exception while processing transaction: reverted with reason string "ERC721Metadata: URI query for nonexistent token" [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="tokenURI(uint256)", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002f4552433732314d657461646174613a2055524920717565727920666f72206e6f6e6578697374656e7420746f6b656e0000000000000000000000000000000000", errorArgs=["ERC721Metadata: URI query for nonexistent token"], errorName="Error", errorSignature="Error(string)", reason="ERC721Metadata: URI query for nonexistent token", code=CALL_EXCEPTION, version=abi/5.6.3)');
    }
  });

  it('Throws when minting more then 300', async () => {
    const signers = await ethers.getSigners();
    const balance = await ERC721Whitelisted.totalSupply();
    expect(balance).to.deep.equal(BigNumber.from(0));

    const tokenUriContractTx = await ERC721Whitelisted.setTokenURIContract(
      tokenURIContract.address,
    );
    await tokenUriContractTx.wait();

    const mint1 = await ERC721Whitelisted.batchMintTo(signers[1].address, 100);
    await mint1.wait();

    const mint2 = await ERC721Whitelisted.batchMintTo(signers[1].address, 100);
    await mint2.wait();

    const mint3 = await ERC721Whitelisted.batchMintTo(signers[1].address, 100);
    await mint3.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(300));

    try {
      const mint4 = await ERC721Whitelisted.batchMintTo(signers[1].address, 1);
      await mint4.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Cannot mint more then 300\'');
    }
  });

  it('Fails when batchMintTo is called by a non-minter role', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    const balance = await nonAdmin.totalSupply();
    expect(balance).to.deep.equal(BigNumber.from(0));

    try {
      const tx = await nonAdmin.batchMintTo(signers[1].address, 100);
      await tx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('Correctly grants role and then allows minting', async () => {
    const signers = await ethers.getSigners();

    const tokenUriContractTx = await ERC721Whitelisted.setTokenURIContract(
      tokenURIContract.address,
    );
    await tokenUriContractTx.wait();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.batchMintTo(signers[1].address, 100);
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }

    const adminRole = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const tx = await ERC721Whitelisted.grantRole(adminRole, signers[1].address);
    await tx.wait();

    const mintTx = await nonAdmin.batchMintTo(signers[1].address, 100);
    await mintTx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(100));
    expect(await ERC721Whitelisted.balanceOf(
      signers[1].address,
    )).to.deep.equal(BigNumber.from(100));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.tokenURI(11)).to.equal('TOKENURI/11');
  });

  it('Correctly revokes role and then fails a token mint', async () => {
    const signers = await ethers.getSigners();

    const tokenUriContractTx = await ERC721Whitelisted.setTokenURIContract(
      tokenURIContract.address,
    );
    await tokenUriContractTx.wait();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.batchMintTo(signers[2].address, 100);
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }

    const adminRole = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const tx = await ERC721Whitelisted.grantRole(adminRole, signers[1].address);
    await tx.wait();

    const mintTx = await nonAdmin.batchMintTo(signers[2].address, 123);
    await mintTx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(123));
    expect(await ERC721Whitelisted.balanceOf(
      signers[2].address,
    )).to.deep.equal(BigNumber.from(123));
    expect(await ERC721Whitelisted.ownerOf(122)).to.equal(signers[2].address);
    expect(await ERC721Whitelisted.tokenURI(15)).to.equal('TOKENURI/15');

    const revokeTx = await ERC721Whitelisted.revokeRole(adminRole, signers[1].address);
    await revokeTx.wait();

    try {
      const secondMintTx = await nonAdmin.batchMintTo(signers[2].address, 33);
      await secondMintTx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('safeTransferFrom workflow', async () => {
    const signers = await ethers.getSigners();
    const balance = await ERC721Whitelisted.totalSupply();
    expect(balance).to.deep.equal(BigNumber.from(0));

    const tokenUriContractTx = await ERC721Whitelisted.setTokenURIContract(
      tokenURIContract.address,
    );
    await tokenUriContractTx.wait();

    const tx = await ERC721Whitelisted.batchMintTo(signers[1].address, 300);
    await tx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(300));
    expect(await ERC721Whitelisted.balanceOf(
      signers[1].address,
    )).to.deep.equal(BigNumber.from(300));

    expect(await ERC721Whitelisted.ownerOf(123)).to.equal(signers[1].address);

    const whale = ERC721Whitelisted.connect(signers[1]);

    const transferTx = await whale['safeTransferFrom(address,address,uint256)'](
      signers[1].address,
      signers[2].address,
      123,
    );
    await transferTx.wait();

    expect(await ERC721Whitelisted.ownerOf(123)).to.equal(signers[2].address);
  });

  it('safeTransferFrom fails without tokens', async () => {
    const signers = await ethers.getSigners();
    const balance = await ERC721Whitelisted.totalSupply();
    expect(balance).to.deep.equal(BigNumber.from(0));

    const tokenUriContractTx = await ERC721Whitelisted.setTokenURIContract(
      tokenURIContract.address,
    );
    await tokenUriContractTx.wait();

    const tx = await ERC721Whitelisted.batchMintTo(signers[1].address, 100);
    await tx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(100));
    expect(await ERC721Whitelisted.balanceOf(
      signers[1].address,
    )).to.deep.equal(BigNumber.from(100));

    expect(await ERC721Whitelisted.ownerOf(99)).to.equal(signers[1].address);

    const whale = ERC721Whitelisted.connect(signers[1]);

    try {
      const transferTx = await whale['safeTransferFrom(address,address,uint256)'](
        signers[1].address,
        signers[2].address,
        100,
      );
      await transferTx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'ERC721: operator query for nonexistent token\'');
    }
  });
});
