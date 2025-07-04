const hre = require("hardhat");

async function main() {
    console.log("Granting ENGAGEMENT_ROLE to ChainReactions contract...\n");
    
    const [deployer] = await ethers.getSigners();
    console.log("Using admin account:", deployer.address);
    
    // Contract addresses
    const EMOJI_TOKEN_ADDRESS = "0x572F036576D1D9F41876e714D47f69CEa6933c36";
    const CHAIN_REACTIONS_ADDRESS = "0xBB7B7A498Fc23084A0322A869e2D121966898EE5";
    
    // Get EmojiToken contract
    const emojiToken = await ethers.getContractAt(
        ["function ENGAGEMENT_ROLE() view returns (bytes32)", 
         "function grantRole(bytes32 role, address account) external"],
        EMOJI_TOKEN_ADDRESS
    );
    
    // Get the ENGAGEMENT_ROLE constant
    const ENGAGEMENT_ROLE = await emojiToken.ENGAGEMENT_ROLE();
    console.log("ENGAGEMENT_ROLE:", ENGAGEMENT_ROLE);
    
    // Grant the role
    console.log("\nGranting role to ChainReactions...");
    const tx = await emojiToken.grantRole(ENGAGEMENT_ROLE, CHAIN_REACTIONS_ADDRESS);
    console.log("Transaction hash:", tx.hash);
    
    // Wait for confirmation
    await tx.wait();
    console.log("✅ Role granted successfully!");
    console.log("\nChainReactions can now burn EMOJI tokens!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });