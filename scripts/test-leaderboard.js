// scripts/test-leaderboard.js
const hre = require("hardhat");

async function main() {
  const LEADERBOARD_V2 = "0xd843166Cd65B13C17228471a4fb24d6A0CdF1023";
  
  const leaderboard = await hre.ethers.getContractAt("LeaderboardAggregator", LEADERBOARD_V2);
  
  const canUpdate = await leaderboard.canUpdate();
  const currentDay = await leaderboard.getCurrentDay();
  const lastUpdateDay = await leaderboard.lastUpdateDay();
  const timeUntilUpdate = await leaderboard.getTimeUntilNextUpdate();
  
  console.log("Contract State:");
  console.log("- Can Update:", canUpdate);
  console.log("- Current Day:", currentDay.toString());
  console.log("- Last Update Day:", lastUpdateDay.toString());
  console.log("- Time Until Update:", timeUntilUpdate.toString(), "seconds");
  console.log("- Time Until Update (hours):", (Number(timeUntilUpdate) / 3600).toFixed(2), "hours");
  
  // Check timestamps
  const now = new Date();
  console.log("\nTime Info:");
  console.log("- Current UTC time:", now.toUTCString());
  console.log("- Hours until midnight UTC:", (24 - now.getUTCHours()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });