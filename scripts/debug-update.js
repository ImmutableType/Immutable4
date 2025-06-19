// scripts/debug-update.js
const hre = require("hardhat");

async function main() {
  const LEADERBOARD_V2 = "0xd843166Cd65B13C17228471a4fb24d6A0CdF1023";
  const PROFILE_NFT = "0x0c4141ec0d87fA1B7820E5AF277024251d392F05";
  const GM_ACTION = "0xaE76fde8f2fc50968182b76f76341d79249A66F5";
  
  const [signer] = await hre.ethers.getSigners();
  const address = await signer.getAddress();
  
  console.log("Debugging update for address:", address);
  
  const leaderboard = await hre.ethers.getContractAt("LeaderboardAggregator", LEADERBOARD_V2);
  
  // Use ProfileNFT instead of IProfileNFT
  const profileNFT = await hre.ethers.getContractAt("ProfileNFT", PROFILE_NFT);
  
  // Check basic conditions
  console.log("\n1. Checking basic conditions:");
  const canUpdate = await leaderboard.canUpdate();
  console.log("   - Can update:", canUpdate);
  
  // Check profile count
  console.log("\n2. Checking profiles:");
  try {
    // Try getting profile 1
    const profile1 = await profileNFT.getProfile(1);
    console.log("   - Profile 1 exists:", profile1.owner);
    
    // Try getting total profiles
    let totalFound = 0;
    for (let i = 1; i <= 10; i++) {
      try {
        await profileNFT.getProfile(i);
        totalFound++;
      } catch (e) {
        break;
      }
    }
    console.log("   - Found profiles:", totalFound);
  } catch (e) {
    console.log("   - Error getting profiles:", e.message);
  }
  
  // Try to calculate a score
  console.log("\n3. Testing score calculation:");
  try {
    const score = await leaderboard.calculateScore(1, address);
    console.log("   - Score for profile 1:", score.toString());
  } catch (e) {
    console.log("   - Error calculating score:", e.message);
  }
  
  // Check GM Action contract
  console.log("\n4. Checking GM Action contract:");
  try {
    const gmAction = await hre.ethers.getContractAt("GMAction", GM_ACTION);
    const stats = await gmAction.getUserStats(address);
    console.log("   - GM stats:", {
      total: stats.total.toString(),
      streak: stats.streak.toString(),
      saidToday: stats.saidToday
    });
  } catch (e) {
    console.log("   - Error getting GM stats:", e.message);
  }
  
  // Try calling with static call to see revert reason
  console.log("\n5. Simulating update with staticCall:");
  try {
    await leaderboard.updateLeaderboard.staticCall();
    console.log("   - Static call succeeded!");
  } catch (error) {
    console.log("   - Static call failed:", error.message);
    if (error.data) {
      console.log("   - Error data:", error.data);
    }
    if (error.reason) {
      console.log("   - Error reason:", error.reason);
    }
  }
  
  // Try to get more specific error
  console.log("\n6. Attempting actual update to get error:");
  try {
    const tx = await leaderboard.updateLeaderboard({ gasLimit: 5000000 });
    console.log("   - Transaction sent!");
  } catch (error) {
    console.log("   - Transaction failed:", error.message);
    if (error.reason) {
      console.log("   - Reason:", error.reason);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });