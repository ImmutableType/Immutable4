// scripts/reset-simple-leaderboard.js
const hre = require("hardhat");

async function main() {
  const LEADERBOARD = "0x513C1aA183877c933c9DC61A22aBD188bcd43980";
  
  const leaderboard = await hre.ethers.getContractAt("SimpleLeaderboard", LEADERBOARD);
  
  console.log("Resetting leaderboard...");
  const tx = await leaderboard.forceReset();
  await tx.wait();
  console.log("✅ Reset complete!");
  
  const canUpdate = await leaderboard.canUpdate();
  console.log("Can now update:", canUpdate);
}

main().catch(console.error);