// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MembershipTokens is ERC721, ERC721URIStorage, Ownable {
    struct Member {
        address owner;
        string name;
        uint256 mintedAt;
        bool isActive;
    }
    
    mapping(uint256 => Member) public members;
    mapping(uint256 => bool) public tokenExists;
    uint256 public constant MAX_TOKEN_ID = 99;
    uint256 public totalMinted;
    
    event TokenMinted(uint256 indexed tokenId, address indexed owner, string name);
    
    constructor(address godTokenOwner) ERC721("ImmutableType Founding Members", "ITFM") Ownable(msg.sender) {
        // Mint God Token #0 to specified address
        _safeMint(godTokenOwner, 0);
        tokenExists[0] = true;
        totalMinted = 1;
        
        members[0] = Member({
            owner: godTokenOwner,
            name: "God Token (Admin)",
            mintedAt: block.timestamp,
            isActive: true
        });
        
        emit TokenMinted(0, godTokenOwner, "God Token (Admin)");
    }
    
    function mintToken(
        uint256 tokenId,
        address to,
        string memory name
    ) external onlyOwner {
        require(tokenId <= MAX_TOKEN_ID, "Token ID exceeds maximum");
        require(!tokenExists[tokenId], "Token already minted");
        require(to != address(0), "Cannot mint to zero address");
        
        _safeMint(to, tokenId);
        tokenExists[tokenId] = true;
        totalMinted++;
        
        members[tokenId] = Member({
            owner: to,
            name: name,
            mintedAt: block.timestamp,
            isActive: true
        });
        
        emit TokenMinted(tokenId, to, name);
    }
    
    function getMember(uint256 tokenId) external view returns (
        address owner,
        string memory name,
        uint256 mintedAt,
        bool isActive
    ) {
        require(tokenExists[tokenId], "Token does not exist");
        Member memory member = members[tokenId];
        return (member.owner, member.name, member.mintedAt, member.isActive);
    }
    
    function isTokenMinted(uint256 tokenId) external view returns (bool) {
        return tokenExists[tokenId];
    }
    
    function getAvailableTokens() external view returns (uint256[] memory) {
        uint256[] memory available = new uint256[](100 - totalMinted);
        uint256 index = 0;
        
        for (uint256 i = 0; i <= MAX_TOKEN_ID; i++) {
            if (!tokenExists[i]) {
                available[index] = i;
                index++;
            }
        }
        
        uint256[] memory result = new uint256[](index);
        for (uint256 i = 0; i < index; i++) {
            result[i] = available[i];
        }
        
        return result;
    }
    
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }
        return super._update(to, tokenId, auth);
    }

    // SVG Generation Functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(tokenExists[tokenId], "Token does not exist");
        
        string memory svg = generateTokenSVG(tokenId);
        string memory json = string(abi.encodePacked(
            '{"name":"ImmutableType Founding Member #',
            toString(tokenId),
            '","description":"Founding member token for ImmutableType decentralized journalism platform","image":"data:image/svg+xml;base64,',
            base64Encode(bytes(svg)),
            '","attributes":[{"trait_type":"Token ID","value":"',
            toString(tokenId),
            '"},{"trait_type":"Type","value":"Founding Member"}]}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", base64Encode(bytes(json))));
    }

    function generateTokenSVG(uint256 tokenId) internal pure returns (string memory) {
        string memory tokenText = string(abi.encodePacked("IT", padZero(tokenId)));
        
        return string(abi.encodePacked(
            '<svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">',
            '<rect width="400" height="250" rx="25" ry="25" fill="#FFD700" stroke="#B8860B" stroke-width="3"/>',
            '<rect x="20" y="20" width="360" height="210" rx="15" ry="15" fill="none" stroke="#B8860B" stroke-width="2"/>',
            '<text x="200" y="130" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#000000">',
            tokenText,
            '</text>',
            '<text x="200" y="180" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#000000">FOUNDING MEMBER</text>',
            '<text x="200" y="200" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#000000">ImmutableType Platform</text>',
            '</svg>'
        ));
    }

    function padZero(uint256 number) internal pure returns (string memory) {
        if (number < 10) {
            return string(abi.encodePacked("0", toString(number)));
        }
        return toString(number);
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen + 32);
        
        assembly {
            let tablePtr := add(table, 1)
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))
            let resultPtr := add(result, 32)
            
            for {} lt(dataPtr, endPtr) {}
            {
               dataPtr := add(dataPtr, 3)
               let input := mload(dataPtr)
               
               mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
               resultPtr := add(resultPtr, 1)
               mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
               resultPtr := add(resultPtr, 1)
               mstore8(resultPtr, mload(add(tablePtr, and(shr( 6, input), 0x3F))))
               resultPtr := add(resultPtr, 1)
               mstore8(resultPtr, mload(add(tablePtr, and(        input,  0x3F))))
               resultPtr := add(resultPtr, 1)
            }
            
            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
            
            mstore(result, encodedLen)
        }
        
        return result;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}