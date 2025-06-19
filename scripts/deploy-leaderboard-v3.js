const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("Deploying LeaderboardAggregator V3 (Fixed GM Interface)...");

  // Get existing contract addresses
  const profileNFT = "0x0c4141ec0d87fA1B7820E5AF277024251d392F05";
  const gmAction = "0xaE76fde8f2fc50968182b76f76341d79249A66F5";
  const membershipTokens = "0xC90bE82B23Dca9453445b69fB22D5A90402654b2";
  const publisherCredentials = "0x8b351Bc93799898a201E796405dBC30Aad49Ee21";
  const emojiToken = "0x572F036576D1D9F41876e714D47f69CEa6933c36";

  // Deploy new LeaderboardAggregator V3
  const LeaderboardAggregator = await ethers.getContractFactory("LeaderboardAggregatorV3");
  const leaderboard = await LeaderboardAggregator.deploy(
    profileNFT,
    gmAction,
    membershipTokens,
    publisherCredentials,
    emojiToken
  );

  await leaderboard.waitForDeployment();
  const address = await leaderboard.getAddress();

  console.log("LeaderboardAggregator V3 deployed to:", address);

  // Save deployment info
  const deploymentInfo = {
    address: address,
    contractName: "LeaderboardAggregatorV3",
    version: "v3",
    network: "flow-evm-testnet",
    deployedAt: new Date().toISOString(),
    constructorArgs: [
      profileNFT,
      gmAction,
      membershipTokens,
      publisherCredentials,
      emojiToken
    ],
    notes: "Fixed GM interface mismatch - getUserStats instead of userStats"
  };

  fs.writeFileSync(
    './deployments/LeaderboardAggregatorV3.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("✅ Deployment complete!");
  console.log("Contract address:", address);
  console.log("Expected your score: 20 (base) + 2*10 (GMs) + 2 (streak) = 42 points");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
