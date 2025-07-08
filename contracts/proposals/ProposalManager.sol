// contracts/proposals/ProposalManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IProfileNFT {
    function hasProfile(address owner) external view returns (bool);
}

interface IMembershipTokens {
    function balanceOf(address owner) external view returns (uint256);
}

interface IPublisherCredentials {
    function balanceOf(address owner) external view returns (uint256);
}

contract ProposalManager is Ownable, ReentrancyGuard {
    // Constants
    uint256 public constant PROPOSAL_FEE = 1 ether; // 1 FLOW
    address public constant TREASURY = 0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2;
    uint256 public constant DAILY_LIMIT = 50;
    uint256 public constant WEEKLY_LIMIT = 100;
    
    // Contract addresses
    IProfileNFT public immutable PROFILE_NFT;
    IMembershipTokens public immutable MEMBERSHIP_TOKENS;
    IPublisherCredentials public immutable PUBLISHER_CREDENTIALS;
    
    // Allowed geographic locations
    string[] public allowedLocations = ["Miami", "Miami-Dade", "Florida", "United States"];
    
    // Enums
    enum ProposalStatus {
        ACTIVE,
        FUNDED,
        ASSIGNED,
        PUBLISHED,
        CANCELLED
    }
    
    // Structs
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string tldr;
        string description;
        string category;
        string location;
        string[] referenceUrls;
        string timeline;
        string contentFormat;
        string journalistRequirements;
        string[] tags;
        uint256 fundingGoal;
        uint256 nftCount;
        uint256 nftPrice;
        uint256 createdAt;
        ProposalStatus status;
    }
    
    // State variables
    uint256 private _proposalIdCounter = 1;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public dailyProposalCount;
    mapping(address => uint256) public weeklyProposalCount;
    mapping(address => uint256) public lastProposalDay;
    mapping(address => uint256) public lastProposalWeek;
    
    // Access control for status updates
    address public proposalEscrowContract;
    address public journalistAssignmentContract;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        string location,
        uint256 fundingGoal
    );
    
    event ProposalStatusUpdated(
        uint256 indexed proposalId,
        ProposalStatus oldStatus,
        ProposalStatus newStatus
    );
    
    constructor(
        address _profileNFT,
        address _membershipTokens,
        address _publisherCredentials
    ) Ownable(msg.sender) {
        PROFILE_NFT = IProfileNFT(_profileNFT);
        MEMBERSHIP_TOKENS = IMembershipTokens(_membershipTokens);
        PUBLISHER_CREDENTIALS = IPublisherCredentials(_publisherCredentials);
    }
    
    // Modifiers
    modifier onlyProposalEscrow() {
        require(msg.sender == proposalEscrowContract, "Only ProposalEscrow can call");
        _;
    }
    
    modifier onlyJournalistAssignment() {
        require(msg.sender == journalistAssignmentContract, "Only JournalistAssignment can call");
        _;
    }
    
    modifier hasRequiredTokens() {
        require(PROFILE_NFT.hasProfile(msg.sender), "Profile NFT required");
        require(
            MEMBERSHIP_TOKENS.balanceOf(msg.sender) > 0 || 
            PUBLISHER_CREDENTIALS.balanceOf(msg.sender) > 0,
            "Membership or Publisher token required"
        );
        _;
    }
    
    modifier validLocation(string memory location) {
        bool isValid = false;
        for (uint i = 0; i < allowedLocations.length; i++) {
            if (keccak256(bytes(location)) == keccak256(bytes(allowedLocations[i]))) {
                isValid = true;
                break;
            }
        }
        require(isValid, "Invalid location");
        _;
    }
    
    modifier withinRateLimits() {
        uint256 currentDay = block.timestamp / 86400;
        uint256 currentWeek = block.timestamp / 604800;
        
        // Reset daily counter if new day
        if (currentDay > lastProposalDay[msg.sender]) {
            dailyProposalCount[msg.sender] = 0;
            lastProposalDay[msg.sender] = currentDay;
        }
        
        // Reset weekly counter if new week
        if (currentWeek > lastProposalWeek[msg.sender]) {
            weeklyProposalCount[msg.sender] = 0;
            lastProposalWeek[msg.sender] = currentWeek;
        }
        
        require(dailyProposalCount[msg.sender] < DAILY_LIMIT, "Daily limit exceeded");
        require(weeklyProposalCount[msg.sender] < WEEKLY_LIMIT, "Weekly limit exceeded");
        _;
    }
    
    // Create proposal
    function createProposal(
        string memory _title,
        string memory _tldr,
        string memory _description,
        string memory _category,
        string memory _location,
        string[] memory _referenceUrls,
        string memory _timeline,
        string memory _contentFormat,
        string memory _journalistRequirements,
        string[] memory _tags,
        uint256 _fundingGoal,
        uint256 _nftCount,
        uint256 _nftPrice
    ) external payable hasRequiredTokens validLocation(_location) withinRateLimits nonReentrant returns (uint256) {
        require(msg.value >= PROPOSAL_FEE, "Insufficient fee");
        require(bytes(_title).length > 0 && bytes(_title).length <= 200, "Invalid title length");
        require(bytes(_tldr).length > 0 && bytes(_tldr).length <= 500, "Invalid tldr length");
        require(bytes(_description).length > 0, "Description required");
        require(bytes(_category).length > 0, "Category required");
        require(bytes(_timeline).length > 0, "Timeline required");
        require(bytes(_contentFormat).length > 0, "Content format required");
        require(_referenceUrls.length <= 3, "Too many reference URLs");
        require(_tags.length <= 10, "Too many tags");
        require(_fundingGoal > 0, "Invalid funding goal");
        require(_nftCount > 0 && _nftCount <= 10000, "Invalid NFT count");
        require(_nftPrice > 0, "Invalid NFT price");
        
        uint256 proposalId = _proposalIdCounter++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: _title,
            tldr: _tldr,
            description: _description,
            category: _category,
            location: _location,
            referenceUrls: _referenceUrls,
            timeline: _timeline,
            contentFormat: _contentFormat,
            journalistRequirements: _journalistRequirements,
            tags: _tags,
            fundingGoal: _fundingGoal,
            nftCount: _nftCount,
            nftPrice: _nftPrice,
            createdAt: block.timestamp,
            status: ProposalStatus.ACTIVE
        });
        
        // Update rate limits
        dailyProposalCount[msg.sender]++;
        weeklyProposalCount[msg.sender]++;
        
        // Send fee to treasury
        payable(TREASURY).transfer(PROPOSAL_FEE);
        
        // Refund excess
        if (msg.value > PROPOSAL_FEE) {
            payable(msg.sender).transfer(msg.value - PROPOSAL_FEE);
        }
        
        emit ProposalCreated(proposalId, msg.sender, _title, _location, _fundingGoal);
        
        return proposalId;
    }
    
    // Get proposal
    function getProposal(uint256 _proposalId) external view returns (Proposal memory) {
        require(_proposalId > 0 && _proposalId < _proposalIdCounter, "Invalid proposal ID");
        return proposals[_proposalId];
    }
    
    // Get proposal reference URLs
    function getProposalReferenceUrls(uint256 _proposalId) external view returns (string[] memory) {
        require(_proposalId > 0 && _proposalId < _proposalIdCounter, "Invalid proposal ID");
        return proposals[_proposalId].referenceUrls;
    }
    
    // Get proposal tags
    function getProposalTags(uint256 _proposalId) external view returns (string[] memory) {
        require(_proposalId > 0 && _proposalId < _proposalIdCounter, "Invalid proposal ID");
        return proposals[_proposalId].tags;
    }
    
    // Update proposal status (restricted)
    function updateProposalStatus(uint256 _proposalId, ProposalStatus _newStatus) external {
        require(_proposalId > 0 && _proposalId < _proposalIdCounter, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        ProposalStatus oldStatus = proposal.status;
        
        // Access control based on status transition
        if (_newStatus == ProposalStatus.FUNDED) {
            require(msg.sender == proposalEscrowContract, "Only ProposalEscrow can set FUNDED");
            require(oldStatus == ProposalStatus.ACTIVE, "Invalid status transition");
        } else if (_newStatus == ProposalStatus.ASSIGNED) {
            require(msg.sender == journalistAssignmentContract, "Only JournalistAssignment can set ASSIGNED");
            require(oldStatus == ProposalStatus.FUNDED, "Invalid status transition");
        } else if (_newStatus == ProposalStatus.PUBLISHED) {
            // Future: Add publisher contract check
            require(oldStatus == ProposalStatus.ASSIGNED, "Invalid status transition");
        } else if (_newStatus == ProposalStatus.CANCELLED) {
            // Future: Add cancellation logic
            require(msg.sender == proposal.proposer || msg.sender == owner(), "Unauthorized");
        }
        
        proposal.status = _newStatus;
        emit ProposalStatusUpdated(_proposalId, oldStatus, _newStatus);
    }
    
    // Admin functions
    function setProposalEscrowContract(address _escrowContract) external onlyOwner {
        proposalEscrowContract = _escrowContract;
    }
    
    function setJournalistAssignmentContract(address _assignmentContract) external onlyOwner {
        journalistAssignmentContract = _assignmentContract;
    }
    
    // Get total proposals
    function getTotalProposals() external view returns (uint256) {
        return _proposalIdCounter - 1;
    }
    
    // Get proposals by proposer
    function getProposalsByProposer(address _proposer) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count proposals
        for (uint256 i = 1; i < _proposalIdCounter; i++) {
            if (proposals[i].proposer == _proposer) {
                count++;
            }
        }
        
        // Create array
        uint256[] memory proposerProposals = new uint256[](count);
        uint256 index = 0;
        
        // Fill array
        for (uint256 i = 1; i < _proposalIdCounter; i++) {
            if (proposals[i].proposer == _proposer) {
                proposerProposals[index] = i;
                index++;
            }
        }
        
        return proposerProposals;
    }
}