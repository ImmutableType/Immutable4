const hre = require("hardhat");

async function main() {
  console.log("Checking contract deployments on Flow EVM Testnet...\n");

  const contracts = {
    "ProfileNFT": "0x0c4141ec0d87fA1B7820E5AF277024251d392F05",
    "GMAction": "0xaE76fde8f2fc50968182b76f76341d79249A66F5",
    "MembershipToken": "0xC90bE82B23Dca9453445b69fB22D5A90402654b2",
    "PublisherToken": "0x8b351Bc93799898a201E796405dBC30Aad49Ee21",
    "EmojiToken": "0x572F036576D1D9F41876e714D47f69CEa6933c36"
  };

  for (const [name, address] of Object.entries(contracts)) {
    try {
      const code = await hre.ethers.provider.getCode(address);
      if (code === "0x") {
        console.log(`❌ ${name}: No contract at ${address}`);
      } else {
        console.log(`✅ ${name}: Contract exists at ${address}`);
        
        // Try to get some basic info
        if (name === "ProfileNFT") {
          const contract = await hre.ethers.getContractAt("IProfileNFT", address);
          try {
            const totalSupply = await contract.totalSupply();
            console.log(`   Total profiles: ${totalSupply}`);
          } catch (e) {
            console.log(`   Could not read totalSupply`);
          }
        }
      }
    } catch (error) {
      console.log(`❌ ${name}: Error checking ${address} - ${error.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
