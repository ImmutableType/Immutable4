// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IProfileNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function totalSupply() external view returns (uint256);
}

interface IGMAction {
    // FIXED: Correct interface to match actual GMAction contract
    function getUserStats(address user) external view returns (
        uint256 total,
        uint256 streak,
        bool saidToday
    );
}

interface IMembershipToken {
    function balanceOf(address owner) external view returns (uint256);
}

interface IEmojiToken {
    function mintReward(address to, uint256 amount) external;
}

contract LeaderboardAggregatorV4 {
    // Constants
    uint256 public constant UPDATE_REWARD_POINTS = 100;
    uint256 public constant UPDATE_REWARD_EMOJI = 10 * 10**18;
    uint256 public constant BASE_SCORE = 20;
    
    // Point values
    uint256 public constant POINTS_PER_ARTICLE = 250;
    uint256 public constant POINTS_PER_COMMUNITY_ARTICLE = 5;
    uint256 public constant POINTS_PER_PROPOSAL = 20;
    uint256 public constant POINTS_PER_FUNDED_PROPOSAL = 100;
    uint256 public constant POINTS_PER_GM = 10;
    
    // Contracts
    IProfileNFT public immutable profileNFT;
    IGMAction public immutable gmAction;
    IMembershipToken public immutable membershipToken;
    IMembershipToken public immutable publisherToken;
    IEmojiToken public immutable emojiToken;
    
    // Future contracts
    address public articlesContract;
    address public proposalsContract;
    address public tipsContract;
    address public communityArticlesContract;
    
    address public owner;
    
    // User points storage
    mapping(address => uint256) public userPoints;
    mapping(address => uint256) public lastPointsUpdate;
    
    // Daily snapshot game
    uint256 public lastSnapshotDay;
    uint256 public lastSnapshotTime;
    mapping(address => uint256) public snapshotUpdateRewards;
    
    // Events
    event LeaderboardSnapshotUpdated(address indexed updater, uint256 timestamp);
    event UserPointsUpdated(address indexed user, uint256 points, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(
        address _profileNFT,
        address _gmAction,
        address _membershipToken,
        address _publisherToken,
        address _emojiToken
    ) {
        owner = msg.sender;
        profileNFT = IProfileNFT(_profileNFT);
        gmAction = IGMAction(_gmAction);
        membershipToken = IMembershipToken(_membershipToken);
        publisherToken = IMembershipToken(_publisherToken);
        emojiToken = IEmojiToken(_emojiToken);
        lastSnapshotTime = block.timestamp;
        lastSnapshotDay = getCurrentDay();
    }
    
    function getCurrentDay() public view returns (uint256) {
        return block.timestamp / 86400;
    }
    
    function updateLeaderboardSnapshot() external {
        uint256 currentDay = getCurrentDay();
        require(currentDay > lastSnapshotDay, "Already updated today");
        
        require(
            membershipToken.balanceOf(msg.sender) > 0 || 
            publisherToken.balanceOf(msg.sender) > 0,
            "Must hold membership or publisher token"
        );
        
        lastSnapshotDay = currentDay;
        lastSnapshotTime = block.timestamp;
        
        snapshotUpdateRewards[msg.sender] += UPDATE_REWARD_POINTS;
        emojiToken.mintReward(msg.sender, UPDATE_REWARD_EMOJI);
        
        emit LeaderboardSnapshotUpdated(msg.sender, block.timestamp);
    }
    
    function updateUserPoints(address user) external {
        uint256 newPoints = calculateUserScore(user);
        userPoints[user] = newPoints;
        lastPointsUpdate[user] = block.timestamp;
        
        emit UserPointsUpdated(user, newPoints, block.timestamp);
    }
    
    function calculateUserScore(address user) public view returns (uint256) {
        uint256 score = BASE_SCORE;
        
        score += snapshotUpdateRewards[user];
        
        // FIXED: Use correct GM interface
        if (address(gmAction) != address(0)) {
            (uint256 totalGMs, uint256 currentStreak,) = gmAction.getUserStats(user);
            score += totalGMs * POINTS_PER_GM;
            score += currentStreak; // Linear streak bonus
        }
        
        // Placeholder functions return 0 for now
        score += getArticleCount(user) * POINTS_PER_ARTICLE;
        score += getCommunityArticleCount(user) * POINTS_PER_COMMUNITY_ARTICLE;
        score += getProposalCount(user) * POINTS_PER_PROPOSAL;
        score += getFundedProposalCount(user) * POINTS_PER_FUNDED_PROPOSAL;
        score += getTipsGivenPoints(user);
        
        return score;
    }
    
    // Placeholder functions
    function getArticleCount(address) public pure returns (uint256) { return 0; }
    function getCommunityArticleCount(address) public pure returns (uint256) { return 0; }
    function getProposalCount(address) public pure returns (uint256) { return 0; }
    function getFundedProposalCount(address) public pure returns (uint256) { return 0; }
    function getTipsGivenPoints(address) public pure returns (uint256) { return 0; }
    
    // View functions
    function canUpdateSnapshot() external view returns (bool) {
        return getCurrentDay() > lastSnapshotDay;
    }
    
    function getUserPoints(address user) external view returns (uint256) {
        return userPoints[user];
    }
    
    function getUserLiveScore(address user) external view returns (uint256) {
        return calculateUserScore(user);
    }
    
    // Owner function to force snapshot reset (for testing)
    function forceSnapshotReset() external onlyOwner {
        lastSnapshotDay = getCurrentDay() - 1;
    }
}
