# ERC721FTS

This is a modified version of the ERC721 OpenZeppelin NFT contract that aims to give back
control over sales of NFTs to the creators. It allows the owner to:

1. set and modify NFT mint and transfer prices
2. mint and transfer NFTs for free, if you are the owner of the contract
3. set and modify base token URI

* Please note that while you will be able to enforce payments for minting and transfers, you
will not be able to enforce receipt of a percentage of the sale price, for example, if you
set transfer price to 1ETH and someone sells their NFT for 100ETH, you will only receive 1ETH.
On the other hand, if someone gives the NFT away for free, they still need to pay you 1ETH
to transfer that NFT.

* You MUST call setBaseURI() after deploying the contract to set the base token URI.

## Hardhat Project

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
