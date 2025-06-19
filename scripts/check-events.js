// scripts/check-events.js
const hre = require("hardhat");

async function main() {
  const LEADERBOARD_V2 = "0xd843166Cd65B13C17228471a4fb24d6A0CdF1023";
  const leaderboard = await hre.ethers.getContractAt("LeaderboardAggregator", LEADERBOARD_V2);
  
  // Get recent events
  const filter = leaderboard.filters.LeaderboardUpdated();
  const events = await leaderboard.queryFilter(filter, -1000); // Last 1000 blocks
  
  console.log("Recent LeaderboardUpdated events:");
  events.forEach((event, i) => {
    console.log(`Event ${i + 1}:`, {
      updater: event.args[0],
      timestamp: new Date(Number(event.args[1]) * 1000).toUTCString(),
      block: event.blockNumber
    });
  });
  
  // Also check current state
  const lastUpdateTime = await leaderboard.lastUpdateTime();
  const lastUpdateDay = await leaderboard.lastUpdateDay();
  console.log("\nCurrent state:");
  console.log("- Last update time:", new Date(Number(lastUpdateTime) * 1000).toUTCString());
  console.log("- Last update day:", lastUpdateDay.toString());
}

main().catch(console.error);