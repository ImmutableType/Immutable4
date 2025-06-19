// SPDX-License-Identifier: MIT
// contracts/token/EmojiToken.sol
pragma solidity ^0.8.19;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract EmojiToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ENGAGEMENT_ROLE = keccak256("ENGAGEMENT_ROLE");
    
    // Total supply and allocations
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100M tokens
    uint256 public constant FOUNDER_ALLOCATION = 10_000_000 * 10**18; // 10M
    uint256 public constant PUBLIC_SALE_ALLOCATION = 40_000_000 * 10**18; // 40M
    uint256 public constant REWARDS_ALLOCATION = 30_000_000 * 10**18; // 30M
    uint256 public constant RESERVE_ALLOCATION = 20_000_000 * 10**18; // 20M
    
    // First 100 profiles allocation (from rewards budget)
    uint256 public constant FIRST_PROFILES_ALLOCATION = 1_000_000 * 10**18; // 1M
    uint256 public constant FIRST_PROFILES_BONUS = 10_000 * 10**18; // 10k tokens per profile
    uint256 public constant MAX_PROFILE_BONUSES = 100;
    
    // Purchase settings
    uint256 public constant PRICE = 0.01 ether; // $0.01 in FLOW
    uint256 public constant MAX_PURCHASE_PERCENTAGE = 10; // Max 10% of circulating supply
    
    // Tracking minted amounts
    uint256 public totalMinted;
    uint256 public publicSaleMinted;
    uint256 public rewardsMinted;
    uint256 public reserveMinted;
    uint256 public profileBonusesIssued;
    
    // Contract addresses
    address public treasury;
    address public profileNFT;
    
    // Tracking profile bonuses
    mapping(uint256 => bool) public profileBonusClaimed;
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 flowPaid); // Changed from ethPaid
    event TokensBurnedForEngagement(address indexed user, uint256 amount, string action);
    event ProfileBonusClaimed(uint256 indexed profileId, address indexed owner, uint256 amount);
    event TreasuryUpdated(address indexed newTreasury);
    
    constructor(address _treasury, address _founder) 
        ERC20("Emoji Token", "EMOJI") 
    {
        require(_treasury != address(0), "Invalid treasury");
        require(_founder != address(0), "Invalid founder");
        
        _grantRole(DEFAULT_ADMIN_ROLE, _founder);
        _grantRole(MINTER_ROLE, _founder);
        treasury = _treasury;
        
        // Mint founder allocation
        _mint(_founder, FOUNDER_ALLOCATION);
        totalMinted = FOUNDER_ALLOCATION;
    }
    
    // Set ProfileNFT contract (one time)
    function setProfileNFT(address _profileNFT) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(profileNFT == address(0), "Already set");
        require(_profileNFT != address(0), "Invalid address");
        profileNFT = _profileNFT;
    }
    
    // Claim bonus for first 100 profiles
    function claimProfileBonus(uint256 profileId) external {
        require(profileNFT != address(0), "ProfileNFT not set");
        require(profileId > 0 && profileId <= MAX_PROFILE_BONUSES, "Not eligible");
        require(!profileBonusClaimed[profileId], "Already claimed");
        
        // Verify caller owns the profile
        require(
            IProfileNFT(profileNFT).ownerOf(profileId) == msg.sender,
            "Not profile owner"
        );
        
        profileBonusClaimed[profileId] = true;
        profileBonusesIssued++;
        
        // Mint from rewards allocation
        rewardsMinted += FIRST_PROFILES_BONUS;
        totalMinted += FIRST_PROFILES_BONUS;
        _mint(msg.sender, FIRST_PROFILES_BONUS);
        
        emit ProfileBonusClaimed(profileId, msg.sender, FIRST_PROFILES_BONUS);
    }
    
    // Public purchase function
    function purchase() external payable {
        require(msg.value > 0, "Must send FLOW");
        
        uint256 amount = (msg.value * 10**18) / PRICE;
        uint256 circulatingSupply = totalSupply();
        uint256 maxPurchase = (circulatingSupply * MAX_PURCHASE_PERCENTAGE) / 100;
        
        require(amount <= maxPurchase, "Exceeds max purchase limit");
        require(publicSaleMinted + amount <= PUBLIC_SALE_ALLOCATION, "Exceeds public sale allocation");
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        publicSaleMinted += amount;
        totalMinted += amount;
        _mint(msg.sender, amount);
        
        // Send FLOW to treasury (not ETH)
        (bool success,) = treasury.call{value: msg.value}("");
        require(success, "FLOW transfer failed"); // Changed from "ETH transfer failed"
        
        emit TokensPurchased(msg.sender, amount, msg.value);

    }
    
    // Minting for rewards (only authorized contracts)
    function mintReward(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(rewardsMinted + amount <= REWARDS_ALLOCATION, "Exceeds rewards allocation");
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        rewardsMinted += amount;
        totalMinted += amount;
        _mint(to, amount);
    }
    
    // Minting from reserve (only admin)
    function mintReserve(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(reserveMinted + amount <= RESERVE_ALLOCATION, "Exceeds reserve allocation");
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        reserveMinted += amount;
        totalMinted += amount;
        _mint(to, amount);
    }
    
    // Burn for engagement (only authorized contracts)
    function burnForEngagement(address from, uint256 amount, string memory action) 
        external 
        onlyRole(ENGAGEMENT_ROLE) 
    {
        _burn(from, amount);
        emit TokensBurnedForEngagement(from, amount, action);
    }
    
    // Admin functions
    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }
    
    // View functions
    function getRemainingAllocation(string memory allocationType) external view returns (uint256) {
        if (keccak256(bytes(allocationType)) == keccak256(bytes("public"))) {
            return PUBLIC_SALE_ALLOCATION - publicSaleMinted;
        } else if (keccak256(bytes(allocationType)) == keccak256(bytes("rewards"))) {
            return REWARDS_ALLOCATION - rewardsMinted;
        } else if (keccak256(bytes(allocationType)) == keccak256(bytes("reserve"))) {
            return RESERVE_ALLOCATION - reserveMinted;
        } else if (keccak256(bytes(allocationType)) == keccak256(bytes("profiles"))) {
            return FIRST_PROFILES_ALLOCATION - (profileBonusesIssued * FIRST_PROFILES_BONUS);
        }
        return 0;
    }
}

interface IProfileNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
}