// scripts/deploy-reader-license-amm-v2.js
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ReaderLicenseAMM v2 with FIXED interface...");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "FLOW");
  
  // Contract addresses
  const ENCRYPTED_ARTICLES_ADDRESS = "0xd99aB3390aAF8BC69940626cdbbBf22F436c6753";
  
  console.log("Using EncryptedArticles at:", ENCRYPTED_ARTICLES_ADDRESS);
  
  // Deploy ReaderLicenseAMM
  console.log("\n📄 Deploying ReaderLicenseAMM...");
  const ReaderLicenseAMM = await hre.ethers.getContractFactory("ReaderLicenseAMM");
  const readerLicenseAMM = await ReaderLicenseAMM.deploy(ENCRYPTED_ARTICLES_ADDRESS);
  
  await readerLicenseAMM.waitForDeployment();
  const ammAddress = await readerLicenseAMM.getAddress();
  
  console.log("✅ ReaderLicenseAMM deployed to:", ammAddress);
  
  // Test the fix immediately
  console.log("\n🧪 Testing the fix...");
  
  try {
    // Test getCurrentPrice for article 8 (has licenses)
    const price8 = await readerLicenseAMM.getCurrentPrice(8);
    console.log("✅ getCurrentPrice(8):", hre.ethers.formatEther(price8), "FLOW");
    
    // Test with other articles that have licenses
    const totalSupply8 = await readerLicenseAMM.totalLicensesEverGenerated(8);
    console.log("✅ Total licenses for article 8:", totalSupply8.toString());
    
    console.log("\n🎉 SUCCESS! The pricing function is now working!");
    
  } catch (error) {
    console.log("❌ Error testing:", error.message);
  }
  
  // Update EncryptedArticles to use new AMM
  console.log("\n🔗 Updating EncryptedArticles to use new AMM...");
  
  try {
    const encryptedArticles = await hre.ethers.getContractAt("EncryptedArticles", ENCRYPTED_ARTICLES_ADDRESS);
    const tx = await encryptedArticles.setReaderLicenseAMM(ammAddress);
    await tx.wait();
    console.log("✅ EncryptedArticles updated to use new AMM");
  } catch (error) {
    console.log("⚠️  Note: You may need to manually call setReaderLicenseAMM() as contract owner");
    console.log("   Error:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    readerLicenseAMM: ammAddress,
    encryptedArticles: ENCRYPTED_ARTICLES_ADDRESS,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    version: "v2-fixed-interface"
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("ReaderLicenseAMM:", deploymentInfo.readerLicenseAMM);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("Block:", deploymentInfo.blockNumber);
  
  // Write deployment info to file
  const fs = require('fs');
  fs.writeFileSync(
    'deployments/ReaderLicenseAMM-v2.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 Deployment info saved to deployments/ReaderLicenseAMM-v2.json");
  
  console.log("\n🎯 NEXT STEPS:");
  console.log("1. Update lib/constants/deployments.ts with new AMM address:");
  console.log(`   READER_LICENSE_AMM: '${ammAddress}',`);
  console.log("2. Test the licenseValueService.ts implementation");
  console.log("3. Implement the React hooks");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
