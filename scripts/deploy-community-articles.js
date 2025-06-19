// scripts/deploy-community-articles.js
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying CommunityArticles contract to Flow EVM testnet...");
  
  // Contract addresses from existing deployments
  const MEMBERSHIP_TOKEN_ADDRESS = "0xC90bE82B23Dca9453445b69fB22D5A90402654b2";
  const TREASURY_WALLET = "0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2";
  
  console.log("📋 Configuration:");
  console.log(`   Membership Tokens: ${MEMBERSHIP_TOKEN_ADDRESS}`);
  console.log(`   Treasury Wallet: ${TREASURY_WALLET}`);
  console.log(`   Article Fee: 0.009 FLOW`);
  console.log(`   Rate Limit: 20 posts/day`);
  
  // Get the contract factory
  const CommunityArticles = await ethers.getContractFactory("CommunityArticles");
  
  // Deploy the contract
  console.log("\n🔨 Deploying contract...");
  const communityArticles = await CommunityArticles.deploy(
    MEMBERSHIP_TOKEN_ADDRESS,
    TREASURY_WALLET
  );
  
  // Wait for deployment
  await communityArticles.waitForDeployment();
  const contractAddress = await communityArticles.getAddress();
  
  console.log("✅ CommunityArticles deployed successfully!");
  console.log(`📍 Contract address: ${contractAddress}`);
  
  // Verify deployment by calling getContractInfo
  console.log("\n🔍 Verifying deployment...");
  try {
    const [membershipContract, treasury, fee, totalArticles] = await communityArticles.getContractInfo();
    
    console.log("✅ Contract verification successful:");
    console.log(`   Membership Contract: ${membershipContract}`);
    console.log(`   Treasury: ${treasury}`);
    console.log(`   Fee: ${ethers.formatEther(fee)} FLOW`);
    console.log(`   Total Articles: ${totalArticles}`);
    
    // Test canUserPost with a sample address (should return false - no membership token)
    const testAddress = "0x1234567890123456789012345678901234567890";
    const canPost = await communityArticles.canUserPost(testAddress);
    console.log(`   Test canUserPost (${testAddress.substring(0,8)}...): ${canPost}`);
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
    process.exit(1);
  }
  
  // Save deployment info
  const deploymentInfo = {
    address: contractAddress,
    contractName: "CommunityArticles",
    network: "flow-evm-testnet",
    deployedAt: new Date().toISOString(),
    membershipTokenAddress: MEMBERSHIP_TOKEN_ADDRESS,
    treasuryWallet: TREASURY_WALLET,
    articleFee: "0.009",
    maxPostsPerDay: 20,
    totalArticles: 0,
    notes: "Community article curation with full on-chain storage - DEPLOYED & VERIFIED"
  };
  
  // Ensure deployments directory exists
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Write deployment info
  const deploymentPath = path.join(deploymentsDir, 'CommunityArticles.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);
  
  // Display integration info
  console.log("\n🔗 Integration Information:");
  console.log("Add this to your environment variables:");
  console.log(`NEXT_PUBLIC_COMMUNITY_ARTICLES_ADDRESS=${contractAddress}`);
  console.log("\nUpdate your service files with:");
  console.log(`const COMMUNITY_ARTICLES_ADDRESS = "${contractAddress}";`);
  
  console.log("\n🎉 Deployment complete! Ready for service layer integration.");
  
  // Gas usage summary
  const deploymentTx = communityArticles.deploymentTransaction();
  if (deploymentTx) {
    console.log(`\n⛽ Gas used for deployment: ${deploymentTx.gasLimit.toString()}`);
  }
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });