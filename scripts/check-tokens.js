// scripts/check-tokens.js
const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const address = await signer.getAddress();
  
  console.log("Checking tokens for address:", address);
  
  // Check membership token
  const membershipToken = await hre.ethers.getContractAt(
    "ERC721",
    "0xC90bE82B23Dca9453445b69fB22D5A90402654b2"
  );
  
  const membershipBalance = await membershipToken.balanceOf(address);
  console.log("Membership token balance:", membershipBalance.toString());
  
  // Check publisher token
  const publisherToken = await hre.ethers.getContractAt(
    "ERC721", 
    "0x8b351Bc93799898a201E796405dBC30Aad49Ee21"
  );
  
  const publisherBalance = await publisherToken.balanceOf(address);
  console.log("Publisher token balance:", publisherBalance.toString());
  
  if (membershipBalance == 0 && publisherBalance == 0) {
    console.log("\n❌ You need either a membership or publisher token to update the leaderboard!");
  } else {
    console.log("\n✅ You have the required tokens!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });