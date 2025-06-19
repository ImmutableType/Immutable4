// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TippingContract is Ownable, ReentrancyGuard {
    address public treasury;
    address public profileNFT;
    address public emojiToken;
    
    uint256 public constant MINIMUM_TIP_AMOUNT = 1e18; // 1 FLOW
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 190; // 1.9%
    
    struct TipStats {
        uint256 totalFlowGiven;
        uint256 totalEmojiGiven;
        uint256 totalFlowReceived;
        uint256 totalEmojiReceived;
        uint256 tipsGivenCount;
        uint256 tipsReceivedCount;
    }
    
    struct ProfileTipStats {
        uint256 totalFlowReceived;
        uint256 totalEmojiReceived;
        uint256 tipCount;
    }
    
    mapping(address => TipStats) public addressTipStats;
    mapping(uint256 => ProfileTipStats) public profileTipStats;
    
    event FlowTipSent(address indexed from, address indexed to, uint256 indexed profileId, uint256 amount, uint256 fee, uint256 emojiRewards, bool isPlatform);
    event EmojiTipSent(address indexed from, address indexed to, uint256 indexed profileId, uint256 amount, bool isPlatform);
    
    constructor(address _treasury, address _profileNFT, address _emojiToken) Ownable(msg.sender) {
        treasury = _treasury;
        profileNFT = _profileNFT;
        emojiToken = _emojiToken;
    }
    
    function tipProfileWithFlow(uint256 profileId) external payable nonReentrant {
        require(msg.value >= MINIMUM_TIP_AMOUNT, "Tip too low");
        address profileOwner = IProfileNFT(profileNFT).ownerOf(profileId);
        require(profileOwner != msg.sender, "Cannot tip yourself");
        
        uint256 fee = (msg.value * PLATFORM_FEE_PERCENTAGE) / 10000;
        if (fee < MINIMUM_TIP_AMOUNT) fee = MINIMUM_TIP_AMOUNT;
        uint256 netAmount = msg.value - fee;
        
        payable(profileOwner).transfer(netAmount);
        payable(treasury).transfer(fee);
        
        addressTipStats[msg.sender].totalFlowGiven += netAmount;
        addressTipStats[msg.sender].tipsGivenCount++;
        addressTipStats[profileOwner].totalFlowReceived += netAmount;
        addressTipStats[profileOwner].tipsReceivedCount++;
        profileTipStats[profileId].totalFlowReceived += netAmount;
        profileTipStats[profileId].tipCount++;
        
        emit FlowTipSent(msg.sender, profileOwner, profileId, netAmount, fee, 0, false);
    }
    
    function tipAddressWithFlow(address recipient) external payable nonReentrant {
        require(msg.value >= MINIMUM_TIP_AMOUNT, "Tip too low");
        require(recipient != msg.sender, "Cannot tip yourself");
        
        uint256 fee = (msg.value * PLATFORM_FEE_PERCENTAGE) / 10000;
        if (fee < MINIMUM_TIP_AMOUNT) fee = MINIMUM_TIP_AMOUNT;
        uint256 netAmount = msg.value - fee;
        
        payable(recipient).transfer(netAmount);
        payable(treasury).transfer(fee);
        
        addressTipStats[msg.sender].totalFlowGiven += netAmount;
        addressTipStats[msg.sender].tipsGivenCount++;
        addressTipStats[recipient].totalFlowReceived += netAmount;
        addressTipStats[recipient].tipsReceivedCount++;
        
        emit FlowTipSent(msg.sender, recipient, 0, netAmount, fee, 0, false);
    }
    
    function tipPlatformWithFlow() external payable nonReentrant {
        require(msg.value >= MINIMUM_TIP_AMOUNT, "Tip too low");
        payable(treasury).transfer(msg.value);
        
        addressTipStats[msg.sender].totalFlowGiven += msg.value;
        addressTipStats[msg.sender].tipsGivenCount++;
        addressTipStats[treasury].totalFlowReceived += msg.value;
        addressTipStats[treasury].tipsReceivedCount++;
        
        emit FlowTipSent(msg.sender, treasury, 0, msg.value, 0, 0, true);
    }
    
    function tipProfileWithEmoji(uint256 profileId, uint256 amount) external nonReentrant {
        address profileOwner = IProfileNFT(profileNFT).ownerOf(profileId);
        require(profileOwner != msg.sender, "Cannot tip yourself");
        
        IERC20(emojiToken).transferFrom(msg.sender, profileOwner, amount);
        
        addressTipStats[msg.sender].totalEmojiGiven += amount;
        addressTipStats[msg.sender].tipsGivenCount++;
        addressTipStats[profileOwner].totalEmojiReceived += amount;
        addressTipStats[profileOwner].tipsReceivedCount++;
        profileTipStats[profileId].totalEmojiReceived += amount;
        profileTipStats[profileId].tipCount++;
        
        emit EmojiTipSent(msg.sender, profileOwner, profileId, amount, false);
    }
    
    function tipAddressWithEmoji(address recipient, uint256 amount) external nonReentrant {
        require(recipient != msg.sender, "Cannot tip yourself");
        
        IERC20(emojiToken).transferFrom(msg.sender, recipient, amount);
        
        addressTipStats[msg.sender].totalEmojiGiven += amount;
        addressTipStats[msg.sender].tipsGivenCount++;
        addressTipStats[recipient].totalEmojiReceived += amount;
        addressTipStats[recipient].tipsReceivedCount++;
        
        emit EmojiTipSent(msg.sender, recipient, 0, amount, false);
    }
    
    function tipPlatformWithEmoji(uint256 amount) external nonReentrant {
        IERC20(emojiToken).transferFrom(msg.sender, treasury, amount);
        
        addressTipStats[msg.sender].totalEmojiGiven += amount;
        addressTipStats[msg.sender].tipsGivenCount++;
        addressTipStats[treasury].totalEmojiReceived += amount;
        addressTipStats[treasury].tipsReceivedCount++;
        
        emit EmojiTipSent(msg.sender, treasury, 0, amount, true);
    }
    
    function getAddressTipStats(address user) external view returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        TipStats memory stats = addressTipStats[user];
        return (stats.totalFlowGiven, stats.totalEmojiGiven, stats.totalFlowReceived, stats.totalEmojiReceived, stats.tipsGivenCount, stats.tipsReceivedCount);
    }
    
    function getProfileTipStats(uint256 profileId) external view returns (uint256, uint256, uint256) {
        ProfileTipStats memory stats = profileTipStats[profileId];
        return (stats.totalFlowReceived, stats.totalEmojiReceived, stats.tipCount);
    }
    
    function getTipsGivenValue(address user) public view returns (uint256) {
        TipStats memory stats = addressTipStats[user];
        return stats.totalFlowGiven + (stats.totalEmojiGiven / 1000);
    }
    
    function getTipsReceivedValue(address user) public view returns (uint256) {
        TipStats memory stats = addressTipStats[user];
        return stats.totalFlowReceived + (stats.totalEmojiReceived / 1000);
    }
    
    function getTotalTipValue(address user) external view returns (uint256) {
        return getTipsGivenValue(user) + getTipsReceivedValue(user);
    }
    
    function getTipsGivenPoints(address user) external view returns (uint256) {
        return getTipsGivenValue(user);
    }
    
    function getMinimumTipAmount() external pure returns (uint256) {
        return MINIMUM_TIP_AMOUNT;
    }
    
    function getPlatformFeePercentage() external pure returns (uint256) {
        return PLATFORM_FEE_PERCENTAGE;
    }
    
    function getTreasuryAddress() external view returns (address) {
        return treasury;
    }
    
    function getProfileNFTAddress() external view returns (address) {
        return profileNFT;
    }
    
    function getEmojiTokenAddress() external view returns (address) {
        return emojiToken;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
}

interface IProfileNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
}
