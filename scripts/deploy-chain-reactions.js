const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("\n🎯 Starting ChainReactions deployment...\n");
    
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "FLOW\n");
    
    // EmojiToken address from deployments
    const EMOJI_TOKEN_ADDRESS = "0x572F036576D1D9F41876e714D47f69CEa6933c36";
    
    // Deploy ChainReactions
    console.log("Deploying ChainReactions contract...");
    const ChainReactions = await ethers.getContractFactory("ChainReactions");
    const chainReactions = await ChainReactions.deploy(EMOJI_TOKEN_ADDRESS);
    await chainReactions.waitForDeployment();
    
    const chainReactionsAddress = await chainReactions.getAddress();
    console.log("✅ ChainReactions deployed to:", chainReactionsAddress);
    
    // Get deployment transaction
    const deploymentTx = chainReactions.deploymentTransaction();
    console.log("Transaction hash:", deploymentTx.hash);
    
    // Wait for confirmations
    console.log("\nWaiting for confirmations...");
    await deploymentTx.wait(5);
    console.log("✅ Deployment confirmed!\n");
    
    // Save deployment info
    const deploymentInfo = {
        address: chainReactionsAddress,
        deployer: deployer.address,
        emojiToken: EMOJI_TOKEN_ADDRESS,
        deploymentBlock: deploymentTx.blockNumber,
        timestamp: new Date().toISOString(),
        network: hre.network.name,
        chainId: (await ethers.provider.getNetwork()).chainId
    };
    
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }
    
    fs.writeFileSync(
        path.join(deploymentsDir, "ChainReactions.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("📝 Deployment info saved to deployments/ChainReactions.json\n");
    
    // Print next steps
    console.log("🚨 IMPORTANT NEXT STEPS:");
    console.log("1. The EmojiToken admin must grant ENGAGEMENT_ROLE to the ChainReactions contract:");
    console.log(`   Address: ${chainReactionsAddress}`);
    console.log("\n2. Use this command (from admin wallet):");
    console.log(`   const ENGAGEMENT_ROLE = await emojiToken.ENGAGEMENT_ROLE();`);
    console.log(`   await emojiToken.grantRole(ENGAGEMENT_ROLE, "${chainReactionsAddress}");`);
    console.log("\n3. Verify the contract on FlowScan:");
    console.log(`   https://evm-testnet.flowscan.io/address/${chainReactionsAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });