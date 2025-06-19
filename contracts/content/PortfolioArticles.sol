// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Interface for Publisher Credentials (from admin directory)
interface IPublisherCredentials {
    function hasValidCredential(address journalist) external view returns (bool);
    function balanceOf(address owner) external view returns (uint256);
}

contract PortfolioArticles is ReentrancyGuard, Ownable {
    uint256 public constant PORTFOLIO_ARTICLE_FEE = 1 ether; // 1 FLOW
    uint256 public constant MAX_POSTS_PER_DAY = 50; // Higher limit for professional content
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    address public immutable PUBLISHER_CREDENTIALS_CONTRACT; // PublisherCredentials contract
    address public immutable TREASURY_WALLET;
    
    struct PortfolioArticle {
        uint256 id;
        string title;
        string description;
        string contentUrl;
        string category;
        string location;
        string[] tags;
        string originalAuthor;
        string sourceDomain;
        string publicationName;      // NEW: Original publication
        string originalPublishDate;  // NEW: When originally published
        string portfolioType;        // NEW: "verification" | "showcase"
        address author;
        uint256 timestamp;
        bool isActive;
    }
    
    struct ArticleInput {
        string title;
        string description;
        string contentUrl;
        string category;
        string location;
        string[] tags;
        string originalAuthor;
        string sourceDomain;
        string publicationName;
        string originalPublishDate;
        string portfolioType;
    }
    
    struct DailyPostTracker {
        uint256 lastPostDay;
        uint256 postsToday;
    }
    
    mapping(uint256 => PortfolioArticle) public articles;
    mapping(address => uint256[]) public authorArticles;
    mapping(address => mapping(string => bool)) public authorUrlPosted;
    mapping(address => DailyPostTracker) public dailyPosts;
    
    uint256 public nextArticleId = 1;
    uint256 public totalArticles = 0;
    
    event PortfolioArticleCreated(
        uint256 indexed articleId,
        address indexed author,
        string indexed category,
        string title,
        string contentUrl,
        string publicationName,
        uint256 timestamp
    );
    
    event TreasuryFeePaid(
        address indexed payer,
        uint256 amount,
        uint256 articleId
    );
    
    constructor(
        address _publisherCredentialsContract,
        address _treasuryWallet
    ) Ownable(msg.sender) {
        PUBLISHER_CREDENTIALS_CONTRACT = _publisherCredentialsContract;
        TREASURY_WALLET = _treasuryWallet;
    }
    
    function createPortfolioArticle(ArticleInput calldata input) external payable nonReentrant {
        // Check for valid publisher credential using the correct interface
        require(
            IPublisherCredentials(PUBLISHER_CREDENTIALS_CONTRACT).hasValidCredential(msg.sender),
            "Valid publisher credential required"
        );
        
        require(msg.value >= PORTFOLIO_ARTICLE_FEE, "Insufficient fee");
        require(bytes(input.title).length > 0, "Title required");
        require(bytes(input.description).length > 0, "Description required");
        require(bytes(input.contentUrl).length > 0, "Content URL required");
        require(bytes(input.publicationName).length > 0, "Publication name required");
        require(bytes(input.description).length <= 200, "Description too long");
        
        _checkRateLimit(msg.sender);
        require(!authorUrlPosted[msg.sender][input.contentUrl], "URL already posted");
        
        uint256 articleId = nextArticleId++;
        
        articles[articleId] = PortfolioArticle({
            id: articleId,
            title: input.title,
            description: input.description,
            contentUrl: input.contentUrl,
            category: input.category,
            location: input.location,
            tags: input.tags,
            originalAuthor: input.originalAuthor,
            sourceDomain: input.sourceDomain,
            publicationName: input.publicationName,
            originalPublishDate: input.originalPublishDate,
            portfolioType: input.portfolioType,
            author: msg.sender,
            timestamp: block.timestamp,
            isActive: true
        });
        
        authorArticles[msg.sender].push(articleId);
        authorUrlPosted[msg.sender][input.contentUrl] = true;
        totalArticles++;
        _updateRateLimit(msg.sender);
        
        (bool success, ) = TREASURY_WALLET.call{value: msg.value}("");
        require(success, "Treasury transfer failed");
        
        emit TreasuryFeePaid(msg.sender, msg.value, articleId);
        emit PortfolioArticleCreated(
            articleId,
            msg.sender,
            input.category,
            input.title,
            input.contentUrl,
            input.publicationName,
            block.timestamp
        );
    }
    
    function getArticle(uint256 _articleId) external view returns (PortfolioArticle memory) {
        require(_articleId > 0 && _articleId < nextArticleId, "Invalid article ID");
        return articles[_articleId];
    }
    
    function getArticlesByAuthor(address _author) external view returns (uint256[] memory) {
        return authorArticles[_author];
    }
    
    function getUserPostingStats(address _user) external view returns (
        uint256 totalPosts,
        uint256 postsToday,
        uint256 remainingToday
    ) {
        totalPosts = authorArticles[_user].length;
        
        DailyPostTracker memory tracker = dailyPosts[_user];
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        
        if (tracker.lastPostDay == currentDay) {
            postsToday = tracker.postsToday;
        } else {
            postsToday = 0;
        }
        
        remainingToday = postsToday >= MAX_POSTS_PER_DAY ? 0 : MAX_POSTS_PER_DAY - postsToday;
    }
    
    function canUserPost(address _user) external view returns (bool) {
        // Use the correct publisher credential check
        if (!IPublisherCredentials(PUBLISHER_CREDENTIALS_CONTRACT).hasValidCredential(_user)) {
            return false;
        }
        
        DailyPostTracker memory tracker = dailyPosts[_user];
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        
        if (tracker.lastPostDay == currentDay && tracker.postsToday >= MAX_POSTS_PER_DAY) {
            return false;
        }
        
        return true;
    }
    
    function getContractInfo() external view returns (
        address publisherCredentialsContract,
        address treasury,
        uint256 fee,
        uint256 totalArticleCount
    ) {
        return (
            PUBLISHER_CREDENTIALS_CONTRACT,
            TREASURY_WALLET,
            PORTFOLIO_ARTICLE_FEE,
            totalArticles
        );
    }
    
    function _checkRateLimit(address _user) internal view {
        DailyPostTracker memory tracker = dailyPosts[_user];
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        
        if (tracker.lastPostDay == currentDay) {
            require(tracker.postsToday < MAX_POSTS_PER_DAY, "Daily post limit reached");
        }
    }
    
    function _updateRateLimit(address _user) internal {
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        DailyPostTracker storage tracker = dailyPosts[_user];
        
        if (tracker.lastPostDay == currentDay) {
            tracker.postsToday++;
        } else {
            tracker.lastPostDay = currentDay;
            tracker.postsToday = 1;
        }
    }
    
    function deactivateArticle(uint256 _articleId) external onlyOwner {
        require(_articleId > 0 && _articleId < nextArticleId, "Invalid article ID");
        articles[_articleId].isActive = false;
    }
    
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }
}