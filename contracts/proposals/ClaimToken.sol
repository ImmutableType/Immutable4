// contracts/proposals/ClaimToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ClaimToken is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 private _tokenIdCounter = 1;
    
    struct TokenData {
        uint256 proposalId;
        uint256 nftAllocation;
        address originalFunder;
        uint256 mintedAt;
    }
    
    mapping(uint256 => TokenData) public tokenData;
    
    event ClaimTokenMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 indexed proposalId,
        uint256 nftAllocation
    );
    
    constructor() ERC721("ImmutableType Claim Token", "ITCLAIM") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function mint(
        address to,
        uint256 proposalId,
        uint256 allocation
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        
        tokenData[tokenId] = TokenData({
            proposalId: proposalId,
            nftAllocation: allocation,
            originalFunder: to,
            mintedAt: block.timestamp
        });
        
        _mint(to, tokenId);
        
        emit ClaimTokenMinted(tokenId, to, proposalId, allocation);
        
        return tokenId;
    }
    
    function getTokenData(uint256 tokenId) external view returns (TokenData memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenData[tokenId];
    }
    
    // Override supportsInterface to include AccessControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}