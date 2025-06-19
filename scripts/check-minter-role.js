// scripts/check-minter-role.js
const hre = require("hardhat");

async function main() {
  const EMOJI_TOKEN = "0x572F036576D1D9F41876e714D47f69CEa6933c36";
  const LEADERBOARD_V2 = "0xd843166Cd65B13C17228471a4fb24d6A0CdF1023";
  const OLD_LEADERBOARD = "0x3E3955Ad63b47Cef7920144B5B38F652503791b4";
  
  const emojiToken = await hre.ethers.getContractAt("EmojiToken", EMOJI_TOKEN);
  const MINTER_ROLE = await emojiToken.MINTER_ROLE();
  
  console.log("MINTER_ROLE hash:", MINTER_ROLE);
  
  // Check if new leaderboard has minter role
  const hasRole = await emojiToken.hasRole(MINTER_ROLE, LEADERBOARD_V2);
  console.log("\nNew LeaderboardAggregator has MINTER_ROLE:", hasRole);
  
  // Check if old leaderboard has minter role
  const oldHasRole = await emojiToken.hasRole(MINTER_ROLE, OLD_LEADERBOARD);
  console.log("Old LeaderboardAggregator has MINTER_ROLE:", oldHasRole);
  
  // Get all accounts with minter role
  const roleCount = await emojiToken.getRoleMemberCount(MINTER_ROLE);
  console.log("\nTotal addresses with MINTER_ROLE:", roleCount.toString());
  
  if (!hasRole) {
    console.log("\n❌ The new LeaderboardAggregator doesn't have MINTER_ROLE!");
    console.log("This is why the update is failing - it can't mint EMOJI rewards.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });