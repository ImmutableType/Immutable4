// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

interface IPublisherCredentials {
    function balanceOf(address owner) external view returns (uint256);
}

interface IMembershipTokens {
    function balanceOf(address owner) external view returns (uint256);
    // REMOVED: function getProfileLocation(address owner) external view returns (string memory);
}

interface IReaderLicenseAMM {
    function mintLicensesToHolder(uint256 articleId, address holder, uint256 count, uint256 editionNumber) external;
}

contract EncryptedArticles is ERC721, ERC721URIStorage, ERC721Royalty, Ownable {
    using Strings for uint256;
    
    // Constants
    uint256 public constant PUBLISHING_FEE = 1 ether; // 1 FLOW
    uint256 public constant BUYER_FEE = 1 ether; // 1 FLOW buyer fee
    uint256 public constant PLATFORM_TAKE_RATE = 190; // 1.9% (basis points: 190/10000)
    uint256 public constant DAILY_NATIVE_LIMIT = 3; // Max 3 native articles per day
    uint256 public constant MAX_TITLE_LENGTH = 200;
    uint256 public constant MAX_SUMMARY_LENGTH = 500;
    uint256 public constant MAX_CONTENT_LENGTH = 25000; // ~25KB of text
    uint256 public constant MAX_TAGS = 10;
    uint256 public constant MAX_TAG_LENGTH = 50;
    
    // Contract addresses
    address public constant TREASURY = 0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2;
    IPublisherCredentials public immutable PUBLISHER_CREDENTIALS;
    IMembershipTokens public immutable MEMBERSHIP_TOKENS;
    IReaderLicenseAMM public READER_LICENSE_AMM;
    
    // Enums
    enum CreationSource { NATIVE, PROPOSAL }
    
    // Structs
    struct Article {
        uint256 id;
        string title;
        string encryptedContent;
        string summary;
        address author;
        string location;
        string category;
        string[] tags;
        uint256 publishedAt;
        uint256 nftCount;
        uint256 nftPrice;
        uint256 journalistRetained;
        uint256 readerLicenseRatio;
        CreationSource creationSource;
        uint256 proposalId;
    }
    
    // State variables
    uint256 private _articleIdCounter;
    uint256 private _tokenIdCounter;
    
    mapping(uint256 => Article) public articles;
    mapping(uint256 => uint256) public tokenToArticle; // NFT tokenId => articleId
    mapping(uint256 => uint256) public tokenToEdition; // NFT tokenId => edition number
    mapping(address => mapping(uint256 => uint256)) public dailyPublishCount; // publisher => day => count
    mapping(uint256 => address[]) public articleNFTHolders; // articleId => holders array
    mapping(uint256 => mapping(address => uint256)) public holderNFTCount; // articleId => holder => count
    mapping(uint256 => uint256[]) public availableEditions; // articleId => available edition numbers
    mapping(uint256 => uint256) public editionsSold; // articleId => count of editions sold
    
    // Events
    event ArticlePublished(
        uint256 indexed articleId,
        address indexed author,
        string title,
        string location,
        uint256 nftCount,
        uint256 nftPrice
    );
    
    event NFTMinted(
        uint256 indexed tokenId,
        uint256 indexed articleId,
        address indexed buyer,
        uint256 editionNumber,
        uint256 price,
        uint256 licensesGenerated
    );

    constructor(
        address _publisherCredentials,
        address _membershipTokens
    ) ERC721("ImmutableType Encrypted Articles", "ITEA") Ownable(msg.sender) {
        PUBLISHER_CREDENTIALS = IPublisherCredentials(_publisherCredentials);
        MEMBERSHIP_TOKENS = IMembershipTokens(_membershipTokens);
        
        // Set default royalty to 4.9% (490 basis points)
        _setDefaultRoyalty(address(this), 490);
    }
    
    // Modifiers
    modifier onlyPublisher() {
        require(PUBLISHER_CREDENTIALS.balanceOf(msg.sender) > 0, "Publisher credentials required");
        _;
    }
    
    // REMOVED: onlyLocalPublisher modifier
    
    // SIMPLIFIED: onlyLocalMember modifier
    modifier onlyLocalMember() {
        require(MEMBERSHIP_TOKENS.balanceOf(msg.sender) > 0, "Membership token required");
        _;
    }
    
    modifier withinDailyLimit() {
        uint256 today = block.timestamp / 86400; // Current day
        require(
            dailyPublishCount[msg.sender][today] < DAILY_NATIVE_LIMIT,
            "Daily native article limit exceeded"
        );
        _;
    }
    
    // Set Reader License AMM address (only owner)
    function setReaderLicenseAMM(address _ammAddress) external onlyOwner {
        READER_LICENSE_AMM = IReaderLicenseAMM(_ammAddress);
    }
    
    // Publish encrypted article - REMOVED GEOGRAPHIC RESTRICTIONS
    function publishArticle(
        string memory _title,
        string memory _encryptedContent,
        string memory _summary,
        string memory _location,
        string memory _category,
        string[] memory _tags,
        uint256 _nftCount,
        uint256 _nftPrice,
        uint256 _journalistRetained,
        uint256 _readerLicenseRatio
    ) external payable onlyPublisher withinDailyLimit { // REMOVED: onlyLocalPublisher(_location)
        require(msg.value >= PUBLISHING_FEE, "Insufficient publishing fee");
        require(bytes(_title).length > 0 && bytes(_title).length <= MAX_TITLE_LENGTH, "Invalid title length");
        require(bytes(_encryptedContent).length > 0 && bytes(_encryptedContent).length <= MAX_CONTENT_LENGTH, "Invalid content length");
        require(bytes(_summary).length > 0 && bytes(_summary).length <= MAX_SUMMARY_LENGTH, "Invalid summary length");
        require(_nftCount > 0 && _nftCount <= 10000, "Invalid NFT count");
        require(_nftPrice > 0, "Invalid NFT price");
        require(_journalistRetained <= _nftCount, "Cannot retain more than total NFTs");
        require(_readerLicenseRatio > 0 && _readerLicenseRatio <= 100, "Invalid license ratio");
        require(_tags.length <= MAX_TAGS, "Too many tags");
        
        // Validate tags
        for (uint256 i = 0; i < _tags.length; i++) {
            require(bytes(_tags[i]).length <= MAX_TAG_LENGTH, "Tag too long");
        }

        uint256 articleId = ++_articleIdCounter;
        
        // Store article
        articles[articleId] = Article({
            id: articleId,
            title: _title,
            encryptedContent: _encryptedContent,
            summary: _summary,
            author: msg.sender,
            location: _location,
            category: _category,
            tags: _tags,
            publishedAt: block.timestamp,
            nftCount: _nftCount,
            nftPrice: _nftPrice,
            journalistRetained: _journalistRetained,
            readerLicenseRatio: _readerLicenseRatio,
            creationSource: CreationSource.NATIVE,
            proposalId: 0
        });
        
        // Initialize available editions (exclude journalist retained editions)
        uint256 publicSaleCount = _nftCount - _journalistRetained;
        for (uint256 i = _journalistRetained + 1; i <= _nftCount; i++) {
            availableEditions[articleId].push(i);
        }
        
        // Update daily count
        uint256 today = block.timestamp / 86400;
        dailyPublishCount[msg.sender][today]++;
        
        // Send publishing fee to treasury
        payable(TREASURY).transfer(PUBLISHING_FEE);
        
        // Refund excess
        if (msg.value > PUBLISHING_FEE) {
            payable(msg.sender).transfer(msg.value - PUBLISHING_FEE);
        }
        
        emit ArticlePublished(articleId, msg.sender, _title, _location, _nftCount, _nftPrice);
    }
    
    // Purchase NFT edition - REMOVED GEOGRAPHIC RESTRICTIONS
    function mintNFTEdition(uint256 _articleId) external payable {
        Article storage article = articles[_articleId];
        require(article.id != 0, "Article does not exist");
        require(holderNFTCount[_articleId][msg.sender] == 0, "Already owns NFT for this article");
        require(availableEditions[_articleId].length > 0, "No editions available for public sale");
        
        // SIMPLIFIED: Check membership only
        require(MEMBERSHIP_TOKENS.balanceOf(msg.sender) > 0, "Membership token required");

        uint256 totalPrice = article.nftPrice + BUYER_FEE;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Get random edition number
        uint256 randomIndex = _getRandomIndex(_articleId) % availableEditions[_articleId].length;
        uint256 editionNumber = availableEditions[_articleId][randomIndex];
        
        // Remove edition from available list
        availableEditions[_articleId][randomIndex] = availableEditions[_articleId][availableEditions[_articleId].length - 1];
        availableEditions[_articleId].pop();

        uint256 tokenId = ++_tokenIdCounter;
        
        // Mint NFT
        _mint(msg.sender, tokenId);
        tokenToArticle[tokenId] = _articleId;
        tokenToEdition[tokenId] = editionNumber;
        
        // Update holder tracking
        if (holderNFTCount[_articleId][msg.sender] == 0) {
            articleNFTHolders[_articleId].push(msg.sender);
        }
        holderNFTCount[_articleId][msg.sender]++;
        editionsSold[_articleId]++;
        
        // Calculate payments
        uint256 platformTake = (article.nftPrice * PLATFORM_TAKE_RATE) / 10000;
        uint256 journalistAmount = article.nftPrice - platformTake;
        
        // Send payments
        payable(article.author).transfer(journalistAmount);
        payable(TREASURY).transfer(platformTake + BUYER_FEE);
        
        // Generate reader licenses with edition number
        if (address(READER_LICENSE_AMM) != address(0)) {
            READER_LICENSE_AMM.mintLicensesToHolder(_articleId, msg.sender, article.readerLicenseRatio, editionNumber);
        }
        
        // Refund excess
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit NFTMinted(tokenId, _articleId, msg.sender, editionNumber, article.nftPrice, article.readerLicenseRatio);
    }
    
    // Generate pseudo-random index for edition selection
    function _getRandomIndex(uint256 _articleId) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            _articleId,
            editionsSold[_articleId]
        )));
    }
    
    // Generate dynamic SVG for NFT
    function generateSVG(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        uint256 articleId = tokenToArticle[tokenId];
        uint256 editionNumber = tokenToEdition[tokenId];
        Article memory article = articles[articleId];
        
        // Color scheme based on category
        string memory primaryColor = "#2B3990"; // Default blockchain blue
        string memory secondaryColor = "#B3211E"; // Typewriter red
        
        if (keccak256(abi.encodePacked(article.category)) == keccak256("Politics")) {
            primaryColor = "#1D7F6E"; // Verification green
        } else if (keccak256(abi.encodePacked(article.category)) == keccak256("Tech")) {
            primaryColor = "#E8A317"; // Alert amber
        }

        return string(abi.encodePacked(
            '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
            '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:', primaryColor, ';stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:', secondaryColor, ';stop-opacity:1" />',
            '</linearGradient></defs>',
            '<rect width="400" height="400" fill="url(#bg)"/>',
            '<rect x="20" y="20" width="360" height="360" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>',
            '<text x="200" y="80" text-anchor="middle" fill="white" font-family="serif" font-size="24" font-weight="bold">',
            'ImmutableType',
            '</text>',
            '<text x="200" y="120" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="serif" font-size="16">',
            article.location,
            '</text>',
            '<text x="200" y="140" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="serif" font-size="14">',
            'Edition #', editionNumber.toString(), '/', article.nftCount.toString(),
            '</text>',
            '<text x="200" y="160" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="serif" font-size="14">',
            article.category,
            '</text>',
            '<foreignObject x="40" y="200" width="320" height="120">',
            '<div xmlns="http://www.w3.org/1999/xhtml" style="color:white;font-family:serif;font-size:12px;text-align:center;word-wrap:break-word;">',
            _truncateString(article.title, 100),
            '</div>',
            '</foreignObject>',
            '<text x="200" y="350" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="serif" font-size="12">',
            'Article #', article.id.toString(),
            '</text>',
            '</svg>'
        ));
    }
    
    // Generate NFT metadata
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        uint256 articleId = tokenToArticle[tokenId];
        uint256 editionNumber = tokenToEdition[tokenId];
        Article memory article = articles[articleId];

        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "', article.title, ' - Edition #', editionNumber.toString(), '",',
                '"description": "', article.summary, '",',
                '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(generateSVG(tokenId))), '",',
                '"attributes": [',
                    '{"trait_type": "Location", "value": "', article.location, '"},',
                    '{"trait_type": "Category", "value": "', article.category, '"},',
                    '{"trait_type": "Author", "value": "', _addressToString(article.author), '"},',
                    '{"trait_type": "Edition Number", "value": "', editionNumber.toString(), '"},',
                    '{"trait_type": "Total Editions", "value": "', article.nftCount.toString(), '"},',
                    '{"trait_type": "Publication Date", "value": "', article.publishedAt.toString(), '"},',
                    '{"trait_type": "Reader Licenses Per NFT", "value": "', article.readerLicenseRatio.toString(), '"}',
                ']',
            '}'
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(dataURI)));
    }
    
    // Get NFT holders for an article
    function getNFTHolders(uint256 _articleId) external view returns (address[] memory) {
        return articleNFTHolders[_articleId];
    }
    
    // Get edition number for a token
    function getEditionNumber(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenToEdition[tokenId];
    }
    
    // Get available editions for an article
    function getAvailableEditions(uint256 _articleId) external view returns (uint256[] memory) {
        return availableEditions[_articleId];
    }
    
    // Get articles by author
    function getArticlesByAuthor(address _author) external view returns (uint256[] memory) {
        uint256 totalArticles = _articleIdCounter;
        uint256 authorArticleCount = 0;
        
        // Count author's articles
        for (uint256 i = 1; i <= totalArticles; i++) {
            if (articles[i].author == _author) {
                authorArticleCount++;
            }
        }
        
        // Create array of author's article IDs
        uint256[] memory authorArticles = new uint256[](authorArticleCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalArticles; i++) {
            if (articles[i].author == _author) {
                authorArticles[index] = i;
                index++;
            }
        }
        
        return authorArticles;
    }
    
    // Get total article count
    function getTotalArticles() external view returns (uint256) {
        return _articleIdCounter;
    }
    
    // Royalty distribution override
    function royaltyInfo(uint256 tokenId, uint256 salePrice) public view override returns (address, uint256) {
        uint256 articleId = tokenToArticle[tokenId];
        Article memory article = articles[articleId];
        
        uint256 royaltyAmount = (salePrice * 490) / 10000; // 4.9%
        uint256 creatorAmount = (royaltyAmount * 98) / 100; // 98% to creator
        
        return (article.author, creatorAmount);
    }
    
    // Utility functions
    function _truncateString(string memory str, uint256 maxLen) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length <= maxLen) {
            return str;
        }
        
        bytes memory result = new bytes(maxLen);
        for (uint256 i = 0; i < maxLen; i++) {
            result[i] = strBytes[i];
        }
        return string(result);
    }
    
    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}