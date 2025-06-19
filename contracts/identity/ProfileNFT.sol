// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface IERC721Minimal {
    function balanceOf(address owner) external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}

contract ProfileNFT is ERC721 {
    // Constants
    address public constant MEMBERSHIP_TOKEN = 0xC90bE82B23Dca9453445b69fB22D5A90402654b2;
    address public constant PUBLISHER_CREDENTIALS = 0x8b351Bc93799898a201E796405dBC30Aad49Ee21;
    
    // Counter for token IDs
    uint256 private _tokenIdCounter = 1; // Start at 1
    
    // Profile struct - packed for gas efficiency
    struct Profile {
        uint256 id;
        address owner;
        uint256 membershipTokenId;
        string displayName;
        string bio;
        string avatarUrl;
        string location;
        uint256 createdAt;
        uint256 lastUpdatedAt;
        string tosVersion;
        uint256 tosAcceptedAt;
    }
    
    // Update history tracking
    struct ProfileUpdate {
        uint256 timestamp;
        string fieldName;
        string oldValue;
        string newValue;
        address updatedBy;
    }
    
    // Storage
    mapping(uint256 => Profile) public profiles;
    mapping(address => uint256) public addressToProfileId;
    mapping(uint256 => ProfileUpdate[]) public profileHistory;
    
    // Events
    event ProfileMinted(
        uint256 indexed profileId,
        address indexed owner,
        uint256 membershipTokenId,
        string displayName
    );
    
    event ProfileUpdated(
        uint256 indexed profileId,
        string[] fieldsUpdated,
        uint256 timestamp
    );
    
    event ProfileTransferred(
        uint256 indexed profileId,
        address indexed from,
        address indexed to
    );
    
    // Constructor
    constructor() ERC721("ImmutableType Profiles", "ITP") {}
    
    // Modifiers
    modifier onlyMembershipHolder() {
        require(
            IERC721Minimal(MEMBERSHIP_TOKEN).balanceOf(msg.sender) > 0,
            "Must hold ImmutableType membership token"
        );
        _;
    }
    
    modifier onlyProfileOwner(uint256 profileId) {
        require(profiles[profileId].owner == msg.sender, "Not profile owner");
        _;
    }
    
    // Mint a new profile
    function mintProfile(
        string memory displayName,
        string memory bio,
        string memory avatarUrl,
        string memory location,
        string memory tosVersion
    ) external onlyMembershipHolder returns (uint256) {
        require(addressToProfileId[msg.sender] == 0, "Address already has a profile");
        require(bytes(displayName).length > 0, "Display name cannot be empty");
        require(bytes(displayName).length <= 50, "Display name too long");
        require(bytes(bio).length <= 500, "Bio too long");
        require(bytes(avatarUrl).length <= 200, "Avatar URL too long");
        require(bytes(location).length <= 100, "Location too long");
        require(bytes(tosVersion).length > 0, "Must accept TOS");
        
        // Get membership token ID
        uint256 membershipTokenId = 999; // Special value indicating "has token but ID unknown"
        
        // Get next token ID
        uint256 profileId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mint NFT
        _safeMint(msg.sender, profileId);
        
        // Store profile data
        profiles[profileId] = Profile({
            id: profileId,
            owner: msg.sender,
            membershipTokenId: membershipTokenId,
            displayName: displayName,
            bio: bio,
            avatarUrl: avatarUrl,
            location: location,
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp,
            tosVersion: tosVersion,
            tosAcceptedAt: block.timestamp
        });
        
        // Map address to profile ID
        addressToProfileId[msg.sender] = profileId;
        
        // Emit event
        emit ProfileMinted(profileId, msg.sender, membershipTokenId, displayName);
        
        return profileId;
    }
    
    // Update profile
    function updateProfile(
        uint256 profileId,
        string memory displayName,
        string memory bio,
        string memory avatarUrl,
        string memory location
    ) external onlyProfileOwner(profileId) {
        require(bytes(displayName).length > 0, "Display name cannot be empty");
        require(bytes(displayName).length <= 50, "Display name too long");
        require(bytes(bio).length <= 500, "Bio too long");
        require(bytes(avatarUrl).length <= 200, "Avatar URL too long");
        require(bytes(location).length <= 100, "Location too long");
        
        Profile storage profile = profiles[profileId];
        string[] memory fieldsUpdated = new string[](4);
        uint8 updateCount = 0;
        
        // Track display name change
        if (keccak256(bytes(profile.displayName)) != keccak256(bytes(displayName))) {
            profileHistory[profileId].push(ProfileUpdate({
                timestamp: block.timestamp,
                fieldName: "displayName",
                oldValue: profile.displayName,
                newValue: displayName,
                updatedBy: msg.sender
            }));
            profile.displayName = displayName;
            fieldsUpdated[updateCount++] = "displayName";
        }
        
        // Track bio change
        if (keccak256(bytes(profile.bio)) != keccak256(bytes(bio))) {
            profileHistory[profileId].push(ProfileUpdate({
                timestamp: block.timestamp,
                fieldName: "bio",
                oldValue: profile.bio,
                newValue: bio,
                updatedBy: msg.sender
            }));
            profile.bio = bio;
            fieldsUpdated[updateCount++] = "bio";
        }
        
        // Track avatar change
        if (keccak256(bytes(profile.avatarUrl)) != keccak256(bytes(avatarUrl))) {
            profileHistory[profileId].push(ProfileUpdate({
                timestamp: block.timestamp,
                fieldName: "avatarUrl",
                oldValue: profile.avatarUrl,
                newValue: avatarUrl,
                updatedBy: msg.sender
            }));
            profile.avatarUrl = avatarUrl;
            fieldsUpdated[updateCount++] = "avatarUrl";
        }
        
        // Track location change
        if (keccak256(bytes(profile.location)) != keccak256(bytes(location))) {
            profileHistory[profileId].push(ProfileUpdate({
                timestamp: block.timestamp,
                fieldName: "location",
                oldValue: profile.location,
                newValue: location,
                updatedBy: msg.sender
            }));
            profile.location = location;
            fieldsUpdated[updateCount++] = "location";
        }
        
        // Update timestamp
        profile.lastUpdatedAt = block.timestamp;
        
        // Emit event with only the fields that were actually updated
        if (updateCount > 0) {
            string[] memory actualUpdates = new string[](updateCount);
            for (uint8 i = 0; i < updateCount; i++) {
                actualUpdates[i] = fieldsUpdated[i];
            }
            emit ProfileUpdated(profileId, actualUpdates, block.timestamp);
        }
    }
    
    // Override _update to handle transfers
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Call parent implementation
        address previousOwner = super._update(to, tokenId, auth);
        
        // If this is a transfer (not mint or burn)
        if (from != address(0) && to != address(0) && from != to) {
            // Update profile owner
            profiles[tokenId].owner = to;
            
            // Update address mappings
            addressToProfileId[from] = 0;
            addressToProfileId[to] = tokenId;
            
            // Record transfer in history
            profileHistory[tokenId].push(ProfileUpdate({
                timestamp: block.timestamp,
                fieldName: "owner",
                oldValue: toAsciiString(from),
                newValue: toAsciiString(to),
                updatedBy: from
            }));
            
            emit ProfileTransferred(tokenId, from, to);
        }
        
        return previousOwner;
    }
    
    // Get full profile data
    function getProfile(uint256 profileId) external view returns (Profile memory) {
        require(_ownerOf(profileId) != address(0), "Profile does not exist");
        return profiles[profileId];
    }
    
    // Get profile by owner address
    function getProfileByAddress(address owner) external view returns (Profile memory) {
        uint256 profileId = addressToProfileId[owner];
        require(profileId != 0, "Address has no profile");
        return profiles[profileId];
    }
    
    // Get update history
    function getProfileHistory(uint256 profileId) external view returns (ProfileUpdate[] memory) {
        require(_ownerOf(profileId) != address(0), "Profile does not exist");
        return profileHistory[profileId];
    }
    
    // Check if address has a profile
    function hasProfile(address owner) external view returns (bool) {
        return addressToProfileId[owner] != 0;
    }
    
    // Get membership token ID of profile owner
    function getProfileMembershipToken(uint256 profileId) external view returns (uint256) {
        require(_ownerOf(profileId) != address(0), "Profile does not exist");
        return profiles[profileId].membershipTokenId;
    }
    
    // Helper function to convert address to string
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(42);
        s[0] = '0';
        s[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i+2] = char(hi);
            s[2*i+3] = char(lo);
        }
        return string(s);
    }
    
    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}