// scripts/test-update.js
const hre = require("hardhat");

async function main() {
  const LEADERBOARD_V2 = "0xd843166Cd65B13C17228471a4fb24d6A0CdF1023";
  const MEMBERSHIP_TOKEN = "0xC90bE82B23Dca9453445b69fB22D5A90402654b2";
  const PUBLISHER_TOKEN = "0x8b351Bc93799898a201E796405dBC30Aad49Ee21";
  
  const [signer] = await hre.ethers.getSigners();
  const address = await signer.getAddress();
  
  console.log("Testing update for address:", address);
  
  // Check tokens
  const membershipToken = await hre.ethers.getContractAt("ERC721", MEMBERSHIP_TOKEN);
  const publisherToken = await hre.ethers.getContractAt("ERC721", PUBLISHER_TOKEN);
  
  const hasMembership = await membershipToken.balanceOf(address);
  const hasPublisher = await publisherToken.balanceOf(address);
  
  console.log("Has membership token:", hasMembership.toString() > 0);
  console.log("Has publisher token:", hasPublisher.toString() > 0);
  
  // Check leaderboard state
  const leaderboard = await hre.ethers.getContractAt("LeaderboardAggregator", LEADERBOARD_V2);
  const canUpdate = await leaderboard.canUpdate();
  const currentDay = await leaderboard.getCurrentDay();
  const lastUpdateDay = await leaderboard.lastUpdateDay();
  
  console.log("\nLeaderboard state:");
  console.log("- Can update:", canUpdate);
  console.log("- Current day:", currentDay.toString());
  console.log("- Last update day:", lastUpdateDay.toString());
  
  // Try to update
  if (canUpdate && (hasMembership > 0 || hasPublisher > 0)) {
    console.log("\nAttempting update...");
    try {
      const tx = await leaderboard.updateLeaderboard();
      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Update successful!");
    } catch (error) {
      console.error("❌ Update failed:", error.message);
    }
  } else {
    console.log("\n❌ Cannot update:");
    if (!canUpdate) console.log("- Already updated today");
    if (hasMembership == 0 && hasPublisher == 0) console.log("- No required tokens");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });