// SPDX-License-Identifier: MIT
// contracts/gamification/SimpleLeaderboard.sol
pragma solidity ^0.8.19;

interface IEmojiToken {
    function mintReward(address to, uint256 amount) external;
}

contract SimpleLeaderboard {
    uint256 public constant UPDATE_REWARD_EMOJI = 10 * 10**18; // 10 EMOJI
    
    IEmojiToken public immutable emojiToken;
    address public owner;
    
    uint256 public lastUpdateDay;
    uint256 public lastUpdateTime;
    
    event LeaderboardUpdated(address indexed updater, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(address _emojiToken) {
        owner = msg.sender;
        emojiToken = IEmojiToken(_emojiToken);
        lastUpdateTime = block.timestamp;
        lastUpdateDay = block.timestamp / 86400;
    }
    
    function getCurrentDay() public view returns (uint256) {
        return block.timestamp / 86400;
    }
    
    function canUpdate() external view returns (bool) {
        return getCurrentDay() > lastUpdateDay;
    }
    
    function updateLeaderboard() external {
        uint256 currentDay = getCurrentDay();
        require(currentDay > lastUpdateDay, "Already updated today");
        
        lastUpdateDay = currentDay;
        lastUpdateTime = block.timestamp;
        
        // Mint EMOJI reward
        emojiToken.mintReward(msg.sender, UPDATE_REWARD_EMOJI);
        
        emit LeaderboardUpdated(msg.sender, block.timestamp);
    }
    
    function forceReset() external onlyOwner {
        lastUpdateDay = 0;
    }
}