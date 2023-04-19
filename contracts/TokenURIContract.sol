// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/Strings.sol";

/**
  @title Token Art 2023 Gift Collection
  @author Token Art x ZKLadder
 */
contract TokenURI {
    using Strings for uint256;

    function tokenURI(uint256 tokenId) public pure returns (string memory) {
        return string(abi.encodePacked("TOKENURI/", tokenId.toString()));
    }
}
