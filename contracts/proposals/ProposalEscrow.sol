// contracts/proposals/ProposalEscrow.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IProposalManager {
    enum ProposalStatus { ACTIVE, FUNDED, ASSIGNED, PUBLISHED, CANCELLED }
    
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
    
    function getProposal(uint256 _proposalId) external view returns (Proposal memory);
    function updateProposalStatus(uint256 _proposalId, ProposalStatus _newStatus) external;
}

interface IClaimToken {
    function mint(address to, uint256 proposalId, uint256 allocation) external returns (uint256);
}

contract ProposalEscrow is Ownable, ReentrancyGuard {
    // Constants
    address public constant TREASURY = 0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2;
    uint256 public constant WITHDRAWAL_PENALTY_PERCENT = 10; // 10% penalty
    uint256 public constant OVERSUBSCRIPTION_PERCENT = 20; // Allow 20% oversubscription (120% total)
    uint256 public constant GRACE_PERIOD = 48 hours;
    uint256 public constant NFT_PER_WALLET_LIMIT = 1; // MVP limitation
    
    // Contract interfaces
    IProposalManager public immutable proposalManager;
    IClaimToken public claimToken;
    
    // Funding information structure
    struct FundingInfo {
        uint256 totalFunded;
        uint256 nftsSold;
        bool fundingComplete;
        uint256 fundingCompletedAt;
        mapping(address => uint256) contributions; // address => NFT count
        mapping(address => uint256) claimTokenIds; // address => claim token ID
    }
    
    // State variables
    mapping(uint256 => FundingInfo) public proposalFunding;
    mapping(uint256 => bool) public fundingInitialized;
    
    // Events
    event FundingInitialized(uint256 indexed proposalId, uint256 fundingGoal, uint256 nftCount);
    event FundingContributed(uint256 indexed proposalId, address indexed contributor, uint256 nftQuantity, uint256 amount);
    event FundingCompleted(uint256 indexed proposalId, uint256 totalFunded, uint256 nftsSold);
    event FundingWithdrawn(uint256 indexed proposalId, address indexed contributor, uint256 refundAmount, uint256 penalty);
    event FundingFinalized(uint256 indexed proposalId, address indexed proposer, uint256 amount);
    event ClaimTokenMinted(uint256 indexed proposalId, address indexed contributor, uint256 tokenId);
    
    constructor(address _proposalManager) Ownable(msg.sender) {
        proposalManager = IProposalManager(_proposalManager);
    }
    
    // Set ClaimToken contract (called after deployment)
    function setClaimToken(address _claimToken) external onlyOwner {
        require(address(claimToken) == address(0), "ClaimToken already set");
        claimToken = IClaimToken(_claimToken);
    }
    
    // Initialize funding for a proposal
    function initializeFunding(uint256 proposalId) external {
        require(!fundingInitialized[proposalId], "Funding already initialized");
        
        IProposalManager.Proposal memory proposal = proposalManager.getProposal(proposalId);
        require(proposal.status == IProposalManager.ProposalStatus.ACTIVE, "Proposal not active");
        require(proposal.fundingGoal > 0, "Invalid funding goal");
        require(proposal.nftCount > 0, "Invalid NFT count");
        
        fundingInitialized[proposalId] = true;
        
        emit FundingInitialized(proposalId, proposal.fundingGoal, proposal.nftCount);
    }
    
    // Contribute funding by purchasing NFTs
    function contributeFunding(uint256 proposalId, uint256 nftQuantity) external payable nonReentrant {
        require(fundingInitialized[proposalId], "Funding not initialized");
        require(nftQuantity > 0, "Must purchase at least 1 NFT");
        require(nftQuantity <= NFT_PER_WALLET_LIMIT, "Exceeds per-wallet limit");
        
        FundingInfo storage funding = proposalFunding[proposalId];
        require(!funding.fundingComplete, "Funding already complete");
        require(funding.contributions[msg.sender] == 0, "Already contributed");
        
        IProposalManager.Proposal memory proposal = proposalManager.getProposal(proposalId);
        require(proposal.status == IProposalManager.ProposalStatus.ACTIVE, "Proposal not active");
        
        // Calculate cost
        uint256 totalCost = proposal.nftPrice * nftQuantity;
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Check if this would exceed the oversubscription limit (120% of goal)
        uint256 maxFunding = proposal.fundingGoal + (proposal.fundingGoal * OVERSUBSCRIPTION_PERCENT / 100);
        require(funding.totalFunded + totalCost <= maxFunding, "Exceeds oversubscription limit");
        
        // Check NFT availability
        uint256 maxNFTs = proposal.nftCount + (proposal.nftCount * OVERSUBSCRIPTION_PERCENT / 100);
        require(funding.nftsSold + nftQuantity <= maxNFTs, "Exceeds available NFTs");
        
        // Update funding state
        funding.contributions[msg.sender] = nftQuantity;
        funding.totalFunded += totalCost;
        funding.nftsSold += nftQuantity;
        
        // Mint ClaimToken NFT
        require(address(claimToken) != address(0), "ClaimToken not set");
        uint256 tokenId = claimToken.mint(msg.sender, proposalId, nftQuantity);
        funding.claimTokenIds[msg.sender] = tokenId;
        
        emit ClaimTokenMinted(proposalId, msg.sender, tokenId);
        emit FundingContributed(proposalId, msg.sender, nftQuantity, totalCost);
        
        // Check if funding goal is reached
        if (funding.totalFunded >= proposal.fundingGoal && !funding.fundingComplete) {
            funding.fundingComplete = true;
            funding.fundingCompletedAt = block.timestamp;
            
            // Update proposal status to FUNDED
            proposalManager.updateProposalStatus(proposalId, IProposalManager.ProposalStatus.FUNDED);
            
            emit FundingCompleted(proposalId, funding.totalFunded, funding.nftsSold);
        }
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
    }
    
    // Withdraw funding (with penalty)
    function withdrawFunding(uint256 proposalId) external nonReentrant {
        FundingInfo storage funding = proposalFunding[proposalId];
        uint256 contribution = funding.contributions[msg.sender];
        require(contribution > 0, "No contribution found");
        
        IProposalManager.Proposal memory proposal = proposalManager.getProposal(proposalId);
        
        // Can only withdraw if:
        // 1. Proposal is cancelled, OR
        // 2. Funding is not complete, OR
        // 3. Still within grace period after funding complete
        require(
            proposal.status == IProposalManager.ProposalStatus.CANCELLED ||
            !funding.fundingComplete ||
            (funding.fundingComplete && block.timestamp <= funding.fundingCompletedAt + GRACE_PERIOD),
            "Withdrawal not allowed"
        );
        
        // Calculate refund with penalty (unless proposal is cancelled)
        uint256 refundAmount = proposal.nftPrice * contribution;
        uint256 penalty = 0;
        
        if (proposal.status != IProposalManager.ProposalStatus.CANCELLED) {
            penalty = refundAmount * WITHDRAWAL_PENALTY_PERCENT / 100;
            refundAmount -= penalty;
        }
        
        // Update state before transfer
        funding.contributions[msg.sender] = 0;
        funding.totalFunded -= (proposal.nftPrice * contribution);
        funding.nftsSold -= contribution;
        
        // TODO: Handle ClaimToken burn or transfer
        // For now, the token remains with the withdrawer but becomes invalid
        
        // Transfer refund
        payable(msg.sender).transfer(refundAmount);
        
        // Transfer penalty to treasury
        if (penalty > 0) {
            payable(TREASURY).transfer(penalty);
        }
        
        emit FundingWithdrawn(proposalId, msg.sender, refundAmount, penalty);
        
        // Check if funding dropped below goal
        if (funding.fundingComplete && funding.totalFunded < proposal.fundingGoal) {
            funding.fundingComplete = false;
            funding.fundingCompletedAt = 0;
            
            // Revert proposal status to ACTIVE
            proposalManager.updateProposalStatus(proposalId, IProposalManager.ProposalStatus.ACTIVE);
        }
    }
    
    // Finalize funding after grace period (proposer withdraws funds)
    function finalizeFunding(uint256 proposalId) external nonReentrant {
        FundingInfo storage funding = proposalFunding[proposalId];
        require(funding.fundingComplete, "Funding not complete");
        require(block.timestamp > funding.fundingCompletedAt + GRACE_PERIOD, "Grace period not over");
        
        IProposalManager.Proposal memory proposal = proposalManager.getProposal(proposalId);
        require(proposal.status == IProposalManager.ProposalStatus.FUNDED, "Invalid proposal status");
        require(msg.sender == proposal.proposer, "Only proposer can finalize");
        
        uint256 amount = funding.totalFunded;
        require(amount > 0, "No funds to withdraw");
        
        // Reset funding amount to prevent re-withdrawal
        funding.totalFunded = 0;
        
        // Transfer funds to proposer
        payable(proposal.proposer).transfer(amount);
        
        emit FundingFinalized(proposalId, proposal.proposer, amount);
    }
    
    // View functions
    function getFundingInfo(uint256 proposalId) external view returns (
        uint256 totalFunded,
        uint256 nftsSold,
        bool fundingComplete,
        uint256 fundingCompletedAt
    ) {
        FundingInfo storage funding = proposalFunding[proposalId];
        return (
            funding.totalFunded,
            funding.nftsSold,
            funding.fundingComplete,
            funding.fundingCompletedAt
        );
    }
    
    function getContribution(uint256 proposalId, address contributor) external view returns (uint256) {
        return proposalFunding[proposalId].contributions[contributor];
    }
    
    function getClaimTokenId(uint256 proposalId, address contributor) external view returns (uint256) {
        return proposalFunding[proposalId].claimTokenIds[contributor];
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}