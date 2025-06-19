// scripts/deploy-emoji-token.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying EmojiToken to Flow EVM Testnet...");

  // Your wallet address for both treasury and founder
  const WALLET_ADDRESS = "0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2";

  // Deploy EmojiToken
  const EmojiToken = await hre.ethers.getContractFactory("EmojiToken");
  const emojiToken = await EmojiToken.deploy(
    WALLET_ADDRESS,  // treasury (where FLOW from sales goes)
    WALLET_ADDRESS   // founder (gets 10M tokens)
  );

  // Wait for deployment
  await emojiToken.waitForDeployment();
  const emojiAddress = await emojiToken.getAddress();

  console.log("EmojiToken deployed to:", emojiAddress);
  console.log("Founder received 10,000,000 EMOJI tokens");
  console.log("\nSave this address for the next deployment!");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    address: emojiAddress,
    chainId: 545,
    deployedAt: new Date().toISOString()
  };
  
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments');
  }
  
  fs.writeFileSync(
    './deployments/EmojiToken.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\nDeployment info saved to ./deployments/EmojiToken.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });