// scripts/test-simple-leaderboard.js
const hre = require("hardhat");

async function main() {
  const LEADERBOARD = "0x513C1aA183877c933c9DC61A22aBD188bcd43980";
  
  const leaderboard = await hre.ethers.getContractAt("SimpleLeaderboard", LEADERBOARD);
  
  const canUpdate = await leaderboard.canUpdate();
  const currentDay = await leaderboard.getCurrentDay();
  const lastUpdateDay = await leaderboard.lastUpdateDay();
  
  console.log("SimpleLeaderboard state:");
  console.log("- Can update:", canUpdate);
  console.log("- Current day:", currentDay.toString());
  console.log("- Last update day:", lastUpdateDay.toString());
  
  if (canUpdate) {
    console.log("\nAttempting update...");
    try {
      const tx = await leaderboard.updateLeaderboard();
      const receipt = await tx.wait();
      console.log("✅ Update successful! Gas used:", receipt.gasUsed.toString());
      console.log("You earned 10 EMOJI!");
    } catch (error) {
      console.error("❌ Update failed:", error.message);
    }
  }
}

main().catch(console.error);