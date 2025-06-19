// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProfileNFT {
    function hasProfile(address owner) external view returns (bool);
}

contract GMActionV2 {
    // Constants
    address public immutable profileNFT;
    address public emojiCreditContract;
    
    // State (same as V1)
    mapping(address => mapping(uint256 => bool)) public hasSaidGM;
    mapping(address => uint256) public totalGMs;
    mapping(address => uint256) public currentStreak;
    mapping(address => uint256) public lastGMDay;
    mapping(uint256 => uint256) public dailyGMCount;
    mapping(uint256 => address[]) public dailyGMUsers;
    
    event GMSaid(address indexed user, uint256 indexed day, uint256 streak);
    event EmojiCreditContractSet(address indexed emojiCredit);
    
    modifier onlyProfileHolder() {
        require(IProfileNFT(profileNFT).hasProfile(msg.sender), "Must have a profile");
        _;
    }
    
    constructor(address _profileNFT) {
        profileNFT = _profileNFT;
    }
    
    function setEmojiCreditContract(address _emojiCredit) external {
        require(emojiCreditContract == address(0), "Already set");
        emojiCreditContract = _emojiCredit;
        emit EmojiCreditContractSet(_emojiCredit);
    }
    
    // FIXED: Miami timezone (UTC-4)
    function getCurrentDay() public view returns (uint256) {
        return (block.timestamp - 4 * 3600) / 86400;
    }
    
    function sayGM() external onlyProfileHolder {
        uint256 today = getCurrentDay();
        require(!hasSaidGM[msg.sender][today], "Already said GM today");
        
        hasSaidGM[msg.sender][today] = true;
        totalGMs[msg.sender]++;
        
        if (lastGMDay[msg.sender] == today - 1) {
            currentStreak[msg.sender]++;
        } else {
            currentStreak[msg.sender] = 1;
        }
        lastGMDay[msg.sender] = today;
        
        dailyGMCount[today]++;
        dailyGMUsers[today].push(msg.sender);
        
        emit GMSaid(msg.sender, today, currentStreak[msg.sender]);
    }
    
    // Same view functions as V1
    function hasUserSaidGMToday(address user) external view returns (bool) {
        return hasSaidGM[user][getCurrentDay()];
    }
    
    function getUserStats(address user) external view returns (uint256 total, uint256 streak, bool saidToday) {
        uint256 today = getCurrentDay();
        return (totalGMs[user], currentStreak[user], hasSaidGM[user][today]);
    }
    
    function getTodaysGMCount() external view returns (uint256) {
        return dailyGMCount[getCurrentDay()];
    }
}