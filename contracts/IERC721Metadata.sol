// SPDX-License-Identifier: MIT
// BASED ON: OpenZeppelin Contracts v4.4.1 (token/ERC721/extensions/IERC721Metadata.sol)
// BASED ON: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/b709eae01d1da91902d06ace340df6b324e6f049/contracts/token/ERC721/extensions/IERC721Metadata.sol

pragma solidity ^0.8.0;

import "./IERC721.sol";

/**
 * @title ERC-721 Non-Fungible Token Standard, optional metadata extension
 * @dev See https://eips.ethereum.org/EIPS/eip-721
 */
interface IERC721Metadata is IERC721 {
    /**
     * @dev Returns the token collection name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the token collection symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);
}