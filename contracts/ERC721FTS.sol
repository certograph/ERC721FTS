// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


// ███████╗██████╗  ██████╗███████╗██████╗  ██╗███████╗████████╗███████╗
// ██╔════╝██╔══██╗██╔════╝╚════██║╚════██╗███║██╔════╝╚══██╔══╝██╔════╝
// █████╗  ██████╔╝██║         ██╔╝ █████╔╝╚██║█████╗     ██║   ███████╗
// ██╔══╝  ██╔══██╗██║        ██╔╝ ██╔═══╝  ██║██╔══╝     ██║   ╚════██║
// ███████╗██║  ██║╚██████╗   ██║  ███████╗ ██║██║        ██║   ███████║
// ╚══════╝╚═╝  ╚═╝ ╚═════╝   ╚═╝  ╚══════╝ ╚═╝╚═╝        ╚═╝   ╚══════╝
//
// ERC721FTS -- an ERC721 contract that enforces payment of token mints and transfers

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ERC721FTS is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    uint256 public mintFee = 1 ether;
    uint256 public transferFee = 1 ether;
    string public baseURI;

    constructor() ERC721("FUPMNFT", "FUPM") {}

    function setBaseURI(string memory _uri) public onlyOwner {
        // MUST be called after you deploy your contract to set base token URI
        baseURI = _uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setMintFee(uint256 _mintFee) public onlyOwner {
        mintFee = _mintFee;
    }

    function setTransferFee(uint256 _transferFee) public onlyOwner {
        transferFee = _transferFee;
    }

    function safeMint(address to) public payable {
        require(msg.value >= mintFee, "Minting is payable");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function safeMintByOwner(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public payable virtual override {
        require(msg.value >= transferFee, "Transfers are payable");
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");

        _transfer(from, to, tokenId);
    }

    function transferFromByOwner(address from, address to, uint256 tokenId) public virtual onlyOwner {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");

        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public payable virtual override {
        require(msg.value >= transferFee, "Transfers are payable");
        _safeTransfer(from, to, tokenId, "");
    }

    function safeTransferFromByOwner(address from, address to, uint256 tokenId) public virtual onlyOwner {
        _safeTransfer(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public payable virtual override {
        require(msg.value >= transferFee, "Transfers are payable");
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        _safeTransfer(from, to, tokenId, data);
    }

    function safeTransferFromByOwner(address from, address to, uint256 tokenId, bytes memory data) public virtual onlyOwner {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        _safeTransfer(from, to, tokenId, data);
    }

    function withdraw() public onlyOwner {
        // withdraw balance to the contract owner's address
        payable(msg.sender).transfer(address(this).balance);
    }
}