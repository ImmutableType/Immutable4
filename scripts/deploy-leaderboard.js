// scripts/deploy-leaderboard.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying LeaderboardAggregator to Flow EVM Testnet...");

  // Existing contract addresses
  const PROFILE_NFT = "0x0c4141ec0d87fA1B7820E5AF277024251d392F05";
  const GM_ACTION = "0xaE76fde8f2fc50968182b76f76341d79249A66F5";
  const MEMBERSHIP_TOKEN = "0xC90bE82B23Dca9453445b69fB22D5A90402654b2";
  const PUBLISHER_TOKEN = "0x8b351Bc93799898a201E796405dBC30Aad49Ee21";
  
  // You'll need to update this after deploying EmojiToken
  const EMOJI_TOKEN = "0x572F036576D1D9F41876e714D47f69CEa6933c36"; // <-- UPDATE THIS!

  if (EMOJI_TOKEN === "PASTE_EMOJI_TOKEN_ADDRESS_HERE") {
    console.error("ERROR: Please update EMOJI_TOKEN address from the previous deployment!");
    process.exit(1);
  }

  // Deploy LeaderboardAggregator
  const LeaderboardAggregator = await hre.ethers.getContractFactory("LeaderboardAggregator");
  const leaderboard = await LeaderboardAggregator.deploy(
    PROFILE_NFT,
    GM_ACTION,
    MEMBERSHIP_TOKEN,
    PUBLISHER_TOKEN,
    EMOJI_TOKEN
  );

  // Wait for deployment
  await leaderboard.waitForDeployment();
  const leaderboardAddress = await leaderboard.getAddress();

  console.log("LeaderboardAggregator deployed to:", leaderboardAddress);

  // Now we need to grant MINTER_ROLE to the LeaderboardAggregator
  console.log("\nGranting MINTER_ROLE to LeaderboardAggregator...");
  
  const emojiToken = await hre.ethers.getContractAt("EmojiToken", EMOJI_TOKEN);
  const MINTER_ROLE = await emojiToken.MINTER_ROLE();
  
  const tx = await emojiToken.grantRole(MINTER_ROLE, leaderboardAddress);
  await tx.wait();
  
  console.log("✅ MINTER_ROLE granted to LeaderboardAggregator");

  // Set ProfileNFT address in EmojiToken
  console.log("\nSetting ProfileNFT address in EmojiToken...");
  const tx2 = await emojiToken.setProfileNFT(PROFILE_NFT);
  await tx2.wait();
  console.log("✅ ProfileNFT address set in EmojiToken");

  console.log("\n🎉 Deployment complete!");
  console.log("\nContract addresses:");
  console.log("- EmojiToken:", EMOJI_TOKEN);
  console.log("- LeaderboardAggregator:", leaderboardAddress);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    address: leaderboardAddress,
    chainId: 545,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    './deployments/LeaderboardAggregator.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\nDeployment info saved to ./deployments/LeaderboardAggregator.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });