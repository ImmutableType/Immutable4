const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying ReaderLicenseAMM with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Read EncryptedArticles deployment info
  const encryptedArticlesPath = path.join(__dirname, "..", "deployments", "EncryptedArticles.json");
  if (!fs.existsSync(encryptedArticlesPath)) {
    throw new Error("EncryptedArticles must be deployed first. Run deploy-encrypted-articles.js first.");
  }

  const encryptedArticlesInfo = JSON.parse(fs.readFileSync(encryptedArticlesPath, "utf8"));
  const ENCRYPTED_ARTICLES_ADDRESS = encryptedArticlesInfo.address;

  console.log("Using EncryptedArticles at:", ENCRYPTED_ARTICLES_ADDRESS);

  // Deploy ReaderLicenseAMM contract
  const ReaderLicenseAMM = await ethers.getContractFactory("ReaderLicenseAMM");
  const readerLicenseAMM = await ReaderLicenseAMM.deploy(ENCRYPTED_ARTICLES_ADDRESS);

  // CHANGED: Wait for deployment
  await readerLicenseAMM.waitForDeployment();

  console.log("ReaderLicenseAMM deployed to:", await readerLicenseAMM.getAddress());

  // Update EncryptedArticles with AMM address
  console.log("Setting AMM address in EncryptedArticles contract...");
  const EncryptedArticles = await ethers.getContractFactory("EncryptedArticles");
  const encryptedArticles = EncryptedArticles.attach(ENCRYPTED_ARTICLES_ADDRESS);
  
  const setAmmTx = await encryptedArticles.setReaderLicenseAMM(await readerLicenseAMM.getAddress());
  await setAmmTx.wait();
  
  console.log("AMM address set in EncryptedArticles contract");

  // Save deployment info
  const deploymentInfo = {
    address: await readerLicenseAMM.getAddress(),
    deployer: deployer.address,
    encryptedArticlesAddress: ENCRYPTED_ARTICLES_ADDRESS,
    deployedAt: new Date().toISOString(),
    network: "Flow EVM Testnet",
    blockNumber: await ethers.provider.getBlockNumber()
  };

  // Save deployment info
  fs.writeFileSync(
    path.join(__dirname, "..", "deployments", "ReaderLicenseAMM.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments/ReaderLicenseAMM.json");
  
  // Verify contract on explorer (if verification is set up)
  console.log("Verify with:");
  console.log(`npx hardhat verify --network flowTestnet ${await readerLicenseAMM.getAddress()} "${ENCRYPTED_ARTICLES_ADDRESS}"`);

  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("EncryptedArticles:", ENCRYPTED_ARTICLES_ADDRESS);
  console.log("ReaderLicenseAMM:", await readerLicenseAMM.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });