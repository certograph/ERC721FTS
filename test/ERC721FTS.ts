import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC721FTS", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployERC721FTSFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("ERC721FTS");
    const nft = await NFT.deploy();

    return { nft, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should have correct mintFee", async function () {
      const { nft } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.constants.WeiPerEther;

      expect(await nft.mintFee()).to.equal(fee);
    });

    it("Should have correct transferFee", async function () {
      const { nft } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.constants.WeiPerEther;

      expect(await nft.transferFee()).to.equal(fee);
    });

    it("Should have correct baseURI", async function () {
      const { nft, otherAccount } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.constants.WeiPerEther;

      await nft.connect(otherAccount).safeMint(otherAccount.address, {value: fee});
      expect(await nft.tokenURI(0)).to.equal('');
    });
  });

  describe("Setting baseURI", function () {
    it("Should successfully change baseURI as owner", async function () {
      const {nft, owner, otherAccount} = await loadFixture(deployERC721FTSFixture);

      await nft.connect(owner).safeMintByOwner(otherAccount.address);
      expect(await nft.tokenURI(0)).to.equal("");
      await nft.connect(owner).setBaseURI("https://www.example.com/");
      expect(await nft.tokenURI(0)).to.equal("https://www.example.com/0");
    });
  });

  describe("Setting fees", function () {
    it("Should successfully change mint fee as owner", async function () {
      const { nft, owner } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.BigNumber.from(100);

      await nft.connect(owner).setMintFee(fee);
      expect(await nft.mintFee()).to.equal(fee);
    });

    it("Should fail to change mint fee as non-owner", async function () {
      const { nft, otherAccount } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.BigNumber.from(100);

      await expect(
          nft.connect(otherAccount).setMintFee(fee)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it("Should successfully change transfer fee as owner", async function () {
      const { nft, owner } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.BigNumber.from(100);

      await nft.connect(owner).setTransferFee(fee);
      expect(await nft.transferFee()).to.equal(fee);
    });

    it("Should fail to change transfer fee as non-owner", async function () {
      const { nft, otherAccount } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.BigNumber.from(100);

      await expect(
          nft.connect(otherAccount).setTransferFee(fee)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

  });

  describe("Minting", function () {

    it("safeMintByOwner: Should allow owner to mint for free", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);

      await nft.connect(owner).safeMintByOwner(otherAccount.address);
    });

    it("safeMintByOwner: Should not allow non-owner to mint for free", async function () {
      const { nft, otherAccount } = await loadFixture(deployERC721FTSFixture);

      await expect(
          nft.connect(otherAccount).safeMintByOwner(otherAccount.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it("safeMint: Should allow to mint for money", async function () {
      const { nft, otherAccount } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.constants.WeiPerEther;

      await nft.connect(otherAccount).safeMint(otherAccount.address, {value: fee});
    });

    it("Should revert mint for money for stingy non-owner", async function () {
      const { nft, otherAccount } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.BigNumber.from(1);

      await expect(
           nft.connect(otherAccount).safeMint(otherAccount.address, {value: fee})
      ).to.be.revertedWith('Minting is payable');
    });
  });

  describe("Transfers", function () {

    it("transferFromByOwner: Should allow owner to transfer for free", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);

      await nft.connect(owner).safeMintByOwner(owner.address);
      await nft.connect(owner).transferFromByOwner(owner.address, otherAccount.address, 0);
    });

    it("transferFromByOwner: Should not allow non-owner to transfer for free", async function () {
      const { nft, otherAccount } = await loadFixture(deployERC721FTSFixture);

      await expect(
          nft.connect(otherAccount).safeMintByOwner(otherAccount.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it("transferFrom: Should allow to transfer for money", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.BigNumber.from(ethers.constants.WeiPerEther);

      await nft.connect(owner).safeMintByOwner(owner.address);
      await nft.connect(owner)
          .transferFrom(owner.address, otherAccount.address, 0, {value: fee});
    });

    it("transferFrom: Should revert transfer for money for stingy non-owner", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.BigNumber.from(1);

      await expect(
          nft.connect(otherAccount).transferFrom(owner.address, otherAccount.address, 0, {value: fee})
      ).to.be.revertedWith('Transfers are payable');
    });

    it("safeTransferFromByOwner: Should allow owner to transfer for free", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);

      await nft.connect(owner).safeMintByOwner(owner.address);
      await nft.connect(owner).functions["safeTransferFromByOwner(address,address,uint256)"](owner.address, otherAccount.address, 0);
    });

    it("safeTransferFromByOwner: Should not allow non-owner to transfer for free", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);

      await nft.connect(owner).safeMintByOwner(owner.address);
      await expect(
          nft.connect(otherAccount).functions["safeTransferFromByOwner(address,address,uint256)"](owner.address, otherAccount.address, 0)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it("safeTransferFromByOwner with data: Should allow owner to transfer for free", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);

      await nft.connect(owner).safeMintByOwner(owner.address);
      await nft.connect(owner).functions["safeTransferFromByOwner(address,address,uint256,bytes)"](owner.address, otherAccount.address, 0, "0x");
    });

    it("safeTransferFromByOwner with data: Should not allow non-owner to transfer for free", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);

      await nft.connect(owner).safeMintByOwner(owner.address);
      await expect(
          nft.connect(otherAccount).functions["safeTransferFromByOwner(address,address,uint256,bytes)"](owner.address, otherAccount.address, 0, "0x")
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it("safeTransferFrom: Should allow to transfer for money", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.BigNumber.from(ethers.constants.WeiPerEther);

      await nft.connect(owner).safeMintByOwner(owner.address);
      await nft.connect(owner).functions["safeTransferFrom(address,address,uint256)"](owner.address, otherAccount.address, 0, {value: fee});
    });

    it("safeTransferFrom: Should revert transfer for money for stingy non-owner", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.BigNumber.from(1);

      await expect(
          nft.connect(owner).functions["safeTransferFrom(address,address,uint256)"](owner.address, otherAccount.address, 0, {value: fee})
      ).to.be.revertedWith('Transfers are payable');
    });

    it("safeTransferFrom with data: Should allow to transfer for money", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.BigNumber.from(ethers.constants.WeiPerEther);

      await nft.connect(owner).safeMintByOwner(owner.address);
      await nft.connect(owner).functions["safeTransferFrom(address,address,uint256,bytes)"](owner.address, otherAccount.address, 0, "0x", {value: fee});
    });

    it("safeTransferFrom with data: Should revert transfer for money for stingy non-owner", async function () {
      const { nft, owner, otherAccount } = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.BigNumber.from(1);

      await expect(
          nft.connect(owner).functions["safeTransferFrom(address,address,uint256,bytes)"](owner.address, otherAccount.address, 0, "0x", {value: fee})
      ).to.be.revertedWith('Transfers are payable');
    });

  });


  describe("Withdrawing balance", function () {
    it("Should allow owner to withdraw balance", async function () {
      const {nft, owner, otherAccount} = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.constants.WeiPerEther;
      const initialBalance = await owner.getBalance();

      await nft.connect(otherAccount).safeMint(otherAccount.address, {value: fee});
      await nft.connect(owner).withdraw();

      const newBalance = await owner.getBalance();

      expect(newBalance.gt(initialBalance)).to.equal(true);
    });

    it("Should not allow non-owner to withdraw balance", async function () {
      const {nft, otherAccount} = await loadFixture(deployERC721FTSFixture);
      const fee = ethers.constants.WeiPerEther;

      await nft.connect(otherAccount).safeMint(otherAccount.address, {value: fee});
      await expect(
          nft.connect(otherAccount).withdraw()
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });
});
