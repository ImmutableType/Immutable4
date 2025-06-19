// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PublisherCredentials is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    struct Credential {
        address journalist;
        string name;
        string[] geographicRights;
        string[] subjectRights;
        uint256 issuedAt;
        bool isActive;
    }
    
    mapping(uint256 => Credential) public credentials;
    mapping(address => uint256) public journalistToTokenId;
    
    event CredentialIssued(uint256 indexed tokenId, address indexed journalist, string name);
    event CredentialRevoked(uint256 indexed tokenId, address indexed journalist);
    
    constructor() ERC721("ImmutableType Publisher Credentials", "ITPC") Ownable(msg.sender) {}
    
    function issueCredential(
        address journalist,
        string memory name,
        string[] memory geographicRights,
        string[] memory subjectRights
    ) external onlyOwner returns (uint256) {
        require(journalistToTokenId[journalist] == 0, "Journalist already has credential");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(journalist, tokenId);
        
        credentials[tokenId] = Credential({
            journalist: journalist,
            name: name,
            geographicRights: geographicRights,
            subjectRights: subjectRights,
            issuedAt: block.timestamp,
            isActive: true
        });
        
        journalistToTokenId[journalist] = tokenId;
        
        emit CredentialIssued(tokenId, journalist, name);
        return tokenId;
    }
    
    function revokeCredential(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        credentials[tokenId].isActive = false;
        address journalist = credentials[tokenId].journalist;
        journalistToTokenId[journalist] = 0;
        
        _burn(tokenId);
        
        emit CredentialRevoked(tokenId, journalist);
    }
    
    function getCredential(uint256 tokenId) external view returns (
        address journalist,
        string memory name,
        string[] memory geographicRights,
        string[] memory subjectRights,
        uint256 issuedAt,
        bool isActive
    ) {
        Credential memory cred = credentials[tokenId];
        return (
            cred.journalist,
            cred.name,
            cred.geographicRights,
            cred.subjectRights,
            cred.issuedAt,
            cred.isActive
        );
    }
    
    function hasValidCredential(address journalist) external view returns (bool) {
        uint256 tokenId = journalistToTokenId[journalist];
        return tokenId != 0 && credentials[tokenId].isActive;
    }
    
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }
        return super._update(to, tokenId, auth);
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
