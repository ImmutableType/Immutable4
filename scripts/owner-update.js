// scripts/owner-update.js
const hre = require("hardhat");

async function main() {
  const LEADERBOARD_V2 = "0xd843166Cd65B13C17228471a4fb24d6A0CdF1023";
  
  console.log("Forcing update as owner...");
  
  const leaderboard = await hre.ethers.getContractAt("LeaderboardAggregator", LEADERBOARD_V2);
  
  // First force the day
  console.log("1. Forcing update day to yesterday...");
  const tx1 = await leaderboard.forceUpdateDay({ gasLimit: 1000000 });
  await tx1.wait();
  console.log("✅ Forced update day");
  
  // Now try to update
  console.log("2. Updating leaderboard...");
  try {
    const tx2 = await leaderboard.updateLeaderboard({ gasLimit: 5000000 });
    const receipt = await tx2.wait();
    console.log("✅ Leaderboard updated! Gas used:", receipt.gasUsed.toString());
    
    // Check new state
    const lastUpdateDay = await leaderboard.lastUpdateDay();
    console.log("New lastUpdateDay:", lastUpdateDay.toString());
  } catch (error) {
    console.error("❌ Update failed:", error.message);
  }
}

main().catch(console.error);