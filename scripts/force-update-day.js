// scripts/force-update-day.js
const hre = require("hardhat");

async function main() {
  const LEADERBOARD_V2 = "0xd843166Cd65B13C17228471a4fb24d6A0CdF1023";
  
  console.log("Forcing leaderboard to allow update...");
  
  const leaderboard = await hre.ethers.getContractAt("LeaderboardAggregator", LEADERBOARD_V2);
  
  // Check before
  const canUpdateBefore = await leaderboard.canUpdate();
  console.log("Can update before:", canUpdateBefore);
  
  // Force update day (sets lastUpdateDay to yesterday)
  const tx = await leaderboard.forceUpdateDay();
  await tx.wait();
  console.log("✅ Force update transaction confirmed");
  
  // Check after
  const canUpdateAfter = await leaderboard.canUpdate();
  const currentDay = await leaderboard.getCurrentDay();
  const lastUpdateDay = await leaderboard.lastUpdateDay();
  
  console.log("\nAfter force update:");
  console.log("- Can update now:", canUpdateAfter);
  console.log("- Current day:", currentDay.toString());
  console.log("- Last update day:", lastUpdateDay.toString());
  console.log("\n🎉 Leaderboard should now show 'Update available!'");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });