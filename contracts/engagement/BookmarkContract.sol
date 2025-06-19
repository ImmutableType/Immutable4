// contracts/engagement/BookmarkContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProfileNFT {
    function hasProfile(address owner) external view returns (bool);
}

contract BookmarkContract {
    // Constants
    address public immutable profileNFT;
    address public immutable treasuryWallet;
    uint256 public constant BOOKMARK_FEE = 0.001 ether; // 0.001 FLOW per bookmark action
    
    // Enums
    enum ContentType { ARTICLE, PROPOSAL }
    
    // Structs
    struct Bookmark {
        string contentId;
        ContentType contentType;
        uint256 timestamp;
        bool isActive;
    }
    
    // State mappings
    mapping(address => Bookmark[]) public userBookmarks;
    mapping(address => mapping(string => mapping(uint8 => uint256))) public bookmarkIndex; // user -> contentId -> contentType -> array index
    mapping(address => mapping(string => mapping(uint8 => bool))) public hasBookmarked;
    mapping(string => mapping(uint8 => uint256)) public totalBookmarks; // contentId -> contentType -> count
    mapping(string => mapping(uint8 => address[])) public bookmarkedBy; // contentId -> contentType -> user addresses
    
    // Events
    event BookmarkAdded(
        address indexed user, 
        string indexed contentId, 
        ContentType indexed contentType,
        uint256 timestamp
    );
    
    event BookmarkRemoved(
        address indexed user, 
        string indexed contentId, 
        ContentType indexed contentType,
        uint256 timestamp
    );
    
    event TreasuryFeePaid(address indexed payer, uint256 amount);
    
    // Modifiers
    modifier onlyProfileHolder() {
        require(IProfileNFT(profileNFT).hasProfile(msg.sender), "Must have a profile");
        _;
    }
    
    modifier validContentType(ContentType contentType) {
        require(
            contentType == ContentType.ARTICLE || contentType == ContentType.PROPOSAL,
            "Invalid content type"
        );
        _;
    }
    
    modifier nonEmptyContentId(string calldata contentId) {
        require(bytes(contentId).length > 0, "Content ID cannot be empty");
        _;
    }
    
    // Constructor
    constructor(address _profileNFT, address _treasuryWallet) {
        require(_profileNFT != address(0), "Invalid ProfileNFT address");
        require(_treasuryWallet != address(0), "Invalid treasury address");
        
        profileNFT = _profileNFT;
        treasuryWallet = _treasuryWallet;
    }
    
    // Main functions
    function addBookmark(
        string calldata contentId, 
        ContentType contentType
    ) 
        external 
        payable 
        onlyProfileHolder 
        validContentType(contentType)
        nonEmptyContentId(contentId)
    {
        require(msg.value >= BOOKMARK_FEE, "Insufficient fee");
        require(!hasBookmarked[msg.sender][contentId][uint8(contentType)], "Already bookmarked");
        
        // Send treasury fee
        payable(treasuryWallet).transfer(BOOKMARK_FEE);
        emit TreasuryFeePaid(msg.sender, BOOKMARK_FEE);
        
        // Refund excess payment
        if (msg.value > BOOKMARK_FEE) {
            payable(msg.sender).transfer(msg.value - BOOKMARK_FEE);
        }
        
        // Add bookmark
        Bookmark memory newBookmark = Bookmark({
            contentId: contentId,
            contentType: contentType,
            timestamp: block.timestamp,
            isActive: true
        });
        
        userBookmarks[msg.sender].push(newBookmark);
        uint256 index = userBookmarks[msg.sender].length - 1;
        
        // Update mappings
        bookmarkIndex[msg.sender][contentId][uint8(contentType)] = index;
        hasBookmarked[msg.sender][contentId][uint8(contentType)] = true;
        totalBookmarks[contentId][uint8(contentType)]++;
        bookmarkedBy[contentId][uint8(contentType)].push(msg.sender);
        
        emit BookmarkAdded(msg.sender, contentId, contentType, block.timestamp);
    }
    
    function removeBookmark(
        string calldata contentId, 
        ContentType contentType
    ) 
        external 
        payable 
        onlyProfileHolder 
        validContentType(contentType)
        nonEmptyContentId(contentId)
    {
        require(msg.value >= BOOKMARK_FEE, "Insufficient fee");
        require(hasBookmarked[msg.sender][contentId][uint8(contentType)], "Not bookmarked");
        
        // Send treasury fee
        payable(treasuryWallet).transfer(BOOKMARK_FEE);
        emit TreasuryFeePaid(msg.sender, BOOKMARK_FEE);
        
        // Refund excess payment
        if (msg.value > BOOKMARK_FEE) {
            payable(msg.sender).transfer(msg.value - BOOKMARK_FEE);
        }
        
        // Remove bookmark (mark as inactive to preserve array structure)
        uint256 index = bookmarkIndex[msg.sender][contentId][uint8(contentType)];
        userBookmarks[msg.sender][index].isActive = false;
        
        // Update mappings
        hasBookmarked[msg.sender][contentId][uint8(contentType)] = false;
        totalBookmarks[contentId][uint8(contentType)]--;
        
        // Remove from bookmarkedBy array
        address[] storage users = bookmarkedBy[contentId][uint8(contentType)];
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] == msg.sender) {
                users[i] = users[users.length - 1];
                users.pop();
                break;
            }
        }
        
        emit BookmarkRemoved(msg.sender, contentId, contentType, block.timestamp);
    }
    
    // View functions
    function getUserBookmarks(address user) external view returns (Bookmark[] memory) {
        Bookmark[] memory allBookmarks = userBookmarks[user];
        
        // Count active bookmarks
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allBookmarks.length; i++) {
            if (allBookmarks[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active bookmarks
        Bookmark[] memory activeBookmarks = new Bookmark[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allBookmarks.length; i++) {
            if (allBookmarks[i].isActive) {
                activeBookmarks[currentIndex] = allBookmarks[i];
                currentIndex++;
            }
        }
        
        return activeBookmarks;
    }
    
    function getUserBookmarkCount(address user) external view returns (uint256) {
        Bookmark[] memory allBookmarks = userBookmarks[user];
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < allBookmarks.length; i++) {
            if (allBookmarks[i].isActive) {
                activeCount++;
            }
        }
        
        return activeCount;
    }
    
    function getUserBookmarksByType(
        address user, 
        ContentType contentType
    ) external view returns (Bookmark[] memory) {
        Bookmark[] memory allBookmarks = userBookmarks[user];
        
        // Count active bookmarks of specified type
        uint256 typeCount = 0;
        for (uint256 i = 0; i < allBookmarks.length; i++) {
            if (allBookmarks[i].isActive && allBookmarks[i].contentType == contentType) {
                typeCount++;
            }
        }
        
        // Create array of bookmarks of specified type
        Bookmark[] memory typeBookmarks = new Bookmark[](typeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allBookmarks.length; i++) {
            if (allBookmarks[i].isActive && allBookmarks[i].contentType == contentType) {
                typeBookmarks[currentIndex] = allBookmarks[i];
                currentIndex++;
            }
        }
        
        return typeBookmarks;
    }
    
    function isBookmarked(
        address user, 
        string calldata contentId, 
        ContentType contentType
    ) external view returns (bool) {
        return hasBookmarked[user][contentId][uint8(contentType)];
    }
    
    function getContentBookmarkCount(
        string calldata contentId, 
        ContentType contentType
    ) external view returns (uint256) {
        return totalBookmarks[contentId][uint8(contentType)];
    }
    
    function getContentBookmarkers(
        string calldata contentId, 
        ContentType contentType
    ) external view returns (address[] memory) {
        return bookmarkedBy[contentId][uint8(contentType)];
    }
    
    function getBookmarkFee() external pure returns (uint256) {
        return BOOKMARK_FEE;
    }
    
    // Admin functions (if needed for upgrades)
    function getContractInfo() external view returns (
        address profileContract,
        address treasury,
        uint256 fee
    ) {
        return (profileNFT, treasuryWallet, BOOKMARK_FEE);
    }
}