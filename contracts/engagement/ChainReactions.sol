// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IEmojiToken {
    function burnForEngagement(address from, uint256 amount, string memory action) external;
}

contract ChainReactions {
    IEmojiToken public immutable emojiToken;
    
    // Track reactions per content
    // contentId => emoji => count
    mapping(uint256 => mapping(string => uint256)) public contentReactions;
    
    // Track unique supporters per content
    mapping(uint256 => uint256) public contentSupporters;
    
    // Track if a user has reacted to content
    mapping(uint256 => mapping(address => bool)) public hasReacted;
    
    // Reaction types (using identifiers instead of Unicode)
    string[4] public validEmojis = ["thumbsUp", "clap", "fire", "thinking"];
    
    // Events
    event ReactionAdded(
        uint256 indexed contentId, 
        address indexed user, 
        string emoji, 
        bool isPowerUp,
        uint256 timestamp
    );
    
    // Errors
    error InvalidEmoji();
    error AlreadyReacted();
    error InvalidContentId();
    
    constructor(address _emojiToken) {
        require(_emojiToken != address(0), "Invalid emoji token address");
        emojiToken = IEmojiToken(_emojiToken);
    }
    
    function addReaction(
        uint256 contentId,
        string memory emoji,
        bool isPowerUp
    ) external {
        // Validate content ID
        if (contentId == 0) revert InvalidContentId();
        
        // Validate emoji
        if (!isValidEmoji(emoji)) revert InvalidEmoji();
        
        // Calculate burn amount (1 EMOJI for regular, 100 for power-up)
        uint256 burnAmount = isPowerUp ? 100 * 10**18 : 1 * 10**18;
        
        // Burn EMOJI tokens from the user
        // This requires the ChainReactions contract to have ENGAGEMENT_ROLE
        emojiToken.burnForEngagement(
            msg.sender,
            burnAmount,
            isPowerUp ? "reaction_powerup" : "reaction"
        );
        
        // Track reaction count
        uint256 reactionValue = isPowerUp ? 100 : 1;
        contentReactions[contentId][emoji] += reactionValue;
        
        // Track unique supporters
        if (!hasReacted[contentId][msg.sender]) {
            hasReacted[contentId][msg.sender] = true;
            contentSupporters[contentId] += 1;
        }
        
        emit ReactionAdded(contentId, msg.sender, emoji, isPowerUp, block.timestamp);
    }
    
    function isValidEmoji(string memory emoji) internal view returns (bool) {
        for (uint i = 0; i < validEmojis.length; i++) {
            if (keccak256(bytes(emoji)) == keccak256(bytes(validEmojis[i]))) {
                return true;
            }
        }
        return false;
    }
    
    // Get all reactions for a content item
    function getReactions(uint256 contentId) external view returns (
        uint256 thumbsUp,
        uint256 clap,
        uint256 fire,
        uint256 thinking,
        uint256 supporters
    ) {
        return (
            contentReactions[contentId]["thumbsUp"],
            contentReactions[contentId]["clap"],
            contentReactions[contentId]["fire"],
            contentReactions[contentId]["thinking"],
            contentSupporters[contentId]
        );
    }
    
    // Get reactions for multiple content items in one call
    function getBatchReactions(uint256[] calldata contentIds) external view returns (
        uint256[] memory thumbsUp,
        uint256[] memory clap,
        uint256[] memory fire,
        uint256[] memory thinking,
        uint256[] memory supporters
    ) {
        uint256 length = contentIds.length;
        thumbsUp = new uint256[](length);
        clap = new uint256[](length);
        fire = new uint256[](length);
        thinking = new uint256[](length);
        supporters = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            uint256 contentId = contentIds[i];
            thumbsUp[i] = contentReactions[contentId]["thumbsUp"];
            clap[i] = contentReactions[contentId]["clap"];
            fire[i] = contentReactions[contentId]["fire"];
            thinking[i] = contentReactions[contentId]["thinking"];
            supporters[i] = contentSupporters[contentId];
        }
    }
}