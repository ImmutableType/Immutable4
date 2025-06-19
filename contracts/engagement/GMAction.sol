// contracts/engagement/GMAction.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProfileNFT {
    function hasProfile(address owner) external view returns (bool);
}

interface IEmojiCredit {
    function mint(address to, uint256 amount) external;
}

contract GMAction {
    // Constants
    address public immutable profileNFT;
    address public emojiCreditContract; // Will be set later
    
    // State
    mapping(address => mapping(uint256 => bool)) public hasSaidGM; // user => day => claimed
    mapping(address => uint256) public totalGMs; // Total GMs per user
    mapping(address => uint256) public currentStreak; // Current streak count
    mapping(address => uint256) public lastGMDay; // Last day user said GM
    
    // Daily stats
    mapping(uint256 => uint256) public dailyGMCount; // day => total GMs that day
    mapping(uint256 => address[]) public dailyGMUsers; // day => users who said GM
    
    // Events
    event GMSaid(address indexed user, uint256 indexed day, uint256 streak);
    event EmojiCreditContractSet(address indexed emojiCredit);
    
    // Modifiers
    modifier onlyProfileHolder() {
        require(IProfileNFT(profileNFT).hasProfile(msg.sender), "Must have a profile");
        _;
    }
    
    constructor(address _profileNFT) {
        profileNFT = _profileNFT;
    }
    
    // Admin function to set emoji credit contract later
    function setEmojiCreditContract(address _emojiCredit) external {
        require(emojiCreditContract == address(0), "Already set");
        emojiCreditContract = _emojiCredit;
        emit EmojiCreditContractSet(_emojiCredit);
    }
    
    // Main function - Say GM
    function sayGM() external onlyProfileHolder {
        uint256 today = getCurrentDay();
        require(!hasSaidGM[msg.sender][today], "Already said GM today");
        
        // Mark as claimed
        hasSaidGM[msg.sender][today] = true;
        totalGMs[msg.sender]++;
        
        // Update streak
        if (lastGMDay[msg.sender] == today - 1) {
            // Continuing streak
            currentStreak[msg.sender]++;
        } else {
            // Starting new streak
            currentStreak[msg.sender] = 1;
        }
        lastGMDay[msg.sender] = today;
        
        // Update daily stats
        dailyGMCount[today]++;
        dailyGMUsers[today].push(msg.sender);
        
        // Mint emoji credit if contract is set
        if (emojiCreditContract != address(0)) {
            IEmojiCredit(emojiCreditContract).mint(msg.sender, 1);
        }
        
        emit GMSaid(msg.sender, today, currentStreak[msg.sender]);
    }
    
    // View functions
    function hasUserSaidGMToday(address user) external view returns (bool) {
        return hasSaidGM[user][getCurrentDay()];
    }
    
    function getUserStats(address user) external view returns (
        uint256 total,
        uint256 streak,
        bool saidToday
    ) {
        uint256 today = getCurrentDay();
        return (
            totalGMs[user],
            currentStreak[user],
            hasSaidGM[user][today]
        );
    }
    
    function getDailyStats(uint256 day) external view returns (
        uint256 count,
        address[] memory users
    ) {
        return (dailyGMCount[day], dailyGMUsers[day]);
    }
    
    function getTodaysGMCount() external view returns (uint256) {
        return dailyGMCount[getCurrentDay()];
    }
    
    // Get current day (UTC)
    function getCurrentDay() public view returns (uint256) {
        return block.timestamp / 86400;
    }
    
    // Convert day to Miami time for display (UI will handle the actual conversion)
    function getMiamiMidnight() external view returns (uint256) {
        // This returns UTC midnight, UI will convert to Miami time
        uint256 currentDay = getCurrentDay();
        return currentDay * 86400;
    }
}