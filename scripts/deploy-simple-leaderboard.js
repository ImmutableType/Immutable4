// scripts/deploy-simple-leaderboard.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleLeaderboard...");
  
  const EMOJI_TOKEN = "0x572F036576D1D9F41876e714D47f69CEa6933c36";
  
  const SimpleLeaderboard = await hre.ethers.getContractFactory("SimpleLeaderboard");
  const leaderboard = await SimpleLeaderboard.deploy(EMOJI_TOKEN);
  await leaderboard.waitForDeployment();
  
  const address = await leaderboard.getAddress();
  console.log("SimpleLeaderboard deployed to:", address);
  
  // Grant MINTER_ROLE
  const emojiToken = await hre.ethers.getContractAt("EmojiToken", EMOJI_TOKEN);
  const MINTER_ROLE = await emojiToken.MINTER_ROLE();
  await emojiToken.grantRole(MINTER_ROLE, address);
  console.log("✅ MINTER_ROLE granted");
  
  // Update deployment file
  const fs = require('fs');
  fs.writeFileSync(
    './deployments/LeaderboardAggregator.json',
    JSON.stringify({
      address: address,
      chainId: 545,
      deployedAt: new Date().toISOString(),
      version: "simple"
    }, null, 2)
  );
  
  console.log("✅ Deployment complete!");
}

main().catch(console.error);