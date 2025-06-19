// SPDX-License-Identifier: MIT
// contracts/gamification/LeaderboardAggregator.sol
pragma solidity ^0.8.19;

interface IProfileNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function totalSupply() external view returns (uint256);
}

interface IGMAction {
    function userStats(address user) external view returns (
        uint256 totalGMs,
        uint256 currentStreak,
        uint256 lastGMTimestamp
    );
}

interface IMembershipToken {
    function balanceOf(address owner) external view returns (uint256);
}

interface IEmojiToken {
    function mintReward(address to, uint256 amount) external;
}

contract LeaderboardAggregator {
    // Constants
    uint256 public constant UPDATE_REWARD_POINTS = 100;
    uint256 public constant UPDATE_REWARD_EMOJI = 10 * 10**18; // 10 EMOJI
    uint256 public constant BASE_SCORE = 20;
    
    // Point values for censorship-resistant journalism
    uint256 public constant POINTS_PER_ARTICLE = 250;          // Native journalism
    uint256 public constant POINTS_PER_COMMUNITY_ARTICLE = 5;  // Curated content
    uint256 public constant POINTS_PER_PROPOSAL = 20;          // Creating proposal
    uint256 public constant POINTS_PER_FUNDED_PROPOSAL = 100;  // Getting funded
    uint256 public constant POINTS_PER_GM = 10;                // Daily engagement
    // Note: POINTS_PER_TIP_GIVEN = 1 point per 1 FLOW (calculated dynamically)
    // Note: STREAK_BONUS = current streak days (linear: day 10 = 10 points)
    
    // Contracts
    IProfileNFT public immutable profileNFT;
    IGMAction public immutable gmAction;
    IMembershipToken public immutable membershipToken;
    IMembershipToken public immutable publisherToken;
    IEmojiToken public immutable emojiToken;
    
    // Future contract addresses (to be set later)
    address public articlesContract;
    address public proposalsContract;
    address public tipsContract;
    address public communityArticlesContract;
    
    // Owner
    address public owner;
    
    // NEW: Individual user points storage (for profiles/reputation systems)
    mapping(address => uint256) public userPoints;
    mapping(address => uint256) public lastPointsUpdate;
    
    // Daily leaderboard snapshot game (keeps gamification!)
    uint256 public lastSnapshotDay;
    uint256 public lastSnapshotTime;
    mapping(address => uint256) public snapshotUpdateRewards;
    
    // Events
    event LeaderboardSnapshotUpdated(address indexed updater, uint256 timestamp);
    event UserPointsUpdated(address indexed user, uint256 points, uint256 timestamp);
    event ContractSet(string contractType, address contractAddress);
    
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
    
    // Get current day (days since unix epoch)
    function getCurrentDay() public view returns (uint256) {
        return block.timestamp / 86400;
    }
    
    // Set future contracts (only owner)
    function setArticlesContract(address _contract) external onlyOwner {
        articlesContract = _contract;
        emit ContractSet("Articles", _contract);
    }
    
    function setProposalsContract(address _contract) external onlyOwner {
        proposalsContract = _contract;
        emit ContractSet("Proposals", _contract);
    }
    
    function setTipsContract(address _contract) external onlyOwner {
        tipsContract = _contract;
        emit ContractSet("Tips", _contract);
    }
    
    function setCommunityArticlesContract(address _contract) external onlyOwner {
        communityArticlesContract = _contract;
        emit ContractSet("CommunityArticles", _contract);
    }
    
    // 🎮 GAMIFIED: Daily leaderboard snapshot update (keeps the game!)
    function updateLeaderboardSnapshot() external {
        uint256 currentDay = getCurrentDay();
        require(currentDay > lastSnapshotDay, "Already updated today");
        
        // Check caller has required token
        require(
            membershipToken.balanceOf(msg.sender) > 0 || 
            publisherToken.balanceOf(msg.sender) > 0,
            "Must hold membership or publisher token"
        );
        
        // Update tracking
        lastSnapshotDay = currentDay;
        lastSnapshotTime = block.timestamp;
        
        // 🎮 REWARD: Give updater points and tokens
        snapshotUpdateRewards[msg.sender] += UPDATE_REWARD_POINTS;
        emojiToken.mintReward(msg.sender, UPDATE_REWARD_EMOJI);
        
        emit LeaderboardSnapshotUpdated(msg.sender, block.timestamp);
    }
    
    // 🔥 NEW: Update individual user points (anyone can call for anyone)
    function updateUserPoints(address user) external {
        uint256 newPoints = calculateUserScore(user);
        userPoints[user] = newPoints;
        lastPointsUpdate[user] = block.timestamp;
        
        emit UserPointsUpdated(user, newPoints, block.timestamp);
    }
    
    // 🔥 NEW: Batch update for gas efficiency
    function updateMultipleUsers(address[] calldata users) external {
        require(users.length <= 10, "Max 10 users per batch");
        
        for (uint i = 0; i < users.length; i++) {
            uint256 newPoints = calculateUserScore(users[i]);
            userPoints[users[i]] = newPoints;
            lastPointsUpdate[users[i]] = block.timestamp;
            
            emit UserPointsUpdated(users[i], newPoints, block.timestamp);
        }
    }
    
    // 🔥 OPTIMIZED: Calculate user score (no storage writes, just math)
    function calculateUserScore(address user) public view returns (uint256) {
        uint256 score = BASE_SCORE;
        
        // Add snapshot update rewards
        score += snapshotUpdateRewards[user];
        
        // GM points and streak bonus
        if (address(gmAction) != address(0)) {
            (uint256 totalGMs, uint256 currentStreak,) = gmAction.userStats(user);
            score += totalGMs * POINTS_PER_GM;
            
            // Linear streak bonus: day 10 = 10 points, day 2000 = 2000 points
            score += currentStreak;
        }
        
        // Future: Articles (placeholder returns 0)
        score += getArticleCount(user) * POINTS_PER_ARTICLE;
        
        // Future: Community articles (placeholder returns 0)  
        score += getCommunityArticleCount(user) * POINTS_PER_COMMUNITY_ARTICLE;
        
        // Future: Proposals (placeholder returns 0)
        score += getProposalCount(user) * POINTS_PER_PROPOSAL;
        score += getFundedProposalCount(user) * POINTS_PER_FUNDED_PROPOSAL;
        
        // Future: Tips given (1 point per 1 FLOW)
        score += getTipsGivenPoints(user);
        
        return score;
    }
    
    // 🔥 Helper: Calculate tip points (1 point per 1 FLOW)
    function calculateTipPoints(uint256 flowAmountWei) internal pure returns (uint256) {
        return flowAmountWei / 1e18; // Convert wei to FLOW tokens
    }
    
    // Placeholder functions for future contracts
    function getArticleCount(address user) public view returns (uint256) {
        if (articlesContract == address(0)) return 0;
        // TODO: Call articlesContract.getAuthorArticleCount(user)
        return 0;
    }
    
    function getCommunityArticleCount(address user) public view returns (uint256) {
        if (communityArticlesContract == address(0)) return 0;
        // TODO: Call communityArticlesContract.getCuratorArticleCount(user)
        return 0;
    }
    
    function getProposalCount(address user) public view returns (uint256) {
        if (proposalsContract == address(0)) return 0;
        // TODO: Call proposalsContract.getCreatorProposalCount(user)
        return 0;
    }
    
    function getFundedProposalCount(address user) public view returns (uint256) {
        if (proposalsContract == address(0)) return 0;
        // TODO: Call proposalsContract.getFundedProposalCount(user)
        return 0;
    }
    
    function getTipsGivenPoints(address user) public view returns (uint256) {
        if (tipsContract == address(0)) return 0;
        // TODO: Call tipsContract.getUserTipsGiven(user) and convert to points
        return 0;
    }
    
    // Owner function to force snapshot update (for testing)
    function forceSnapshotReset() external onlyOwner {
        lastSnapshotDay = getCurrentDay() - 1;
    }
    
    // View functions for UI
    function canUpdateSnapshot() external view returns (bool) {
        return getCurrentDay() > lastSnapshotDay;
    }
    
    function getTimeUntilNextSnapshot() external view returns (uint256) {
        uint256 currentDay = getCurrentDay();
        if (currentDay > lastSnapshotDay) {
            return 0; // Update available now
        }
        
        // Calculate seconds until midnight UTC
        uint256 secondsSinceLastMidnight = block.timestamp % 86400;
        return 86400 - secondsSinceLastMidnight;
    }
    
    function getSnapshotInfo() external view returns (bool canUpdate, uint256 timeUntilUpdate, uint256 lastUpdate) {
        return (
            getCurrentDay() > lastSnapshotDay,
            this.getTimeUntilNextSnapshot(),
            lastSnapshotTime
        );
    }
    
    // 🔥 NEW: Get user's current points (for profiles/reputation systems)
    function getUserPoints(address user) external view returns (uint256) {
        return userPoints[user];
    }
    
    // 🔥 NEW: Get live calculated score (always current)
    function getUserLiveScore(address user) external view returns (uint256) {
        return calculateUserScore(user);
    }
}