const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying EncryptedArticles with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Contract addresses on Flow EVM testnet
  const PUBLISHER_CREDENTIALS = "0x8b351Bc93799898a201E796405dBC30Aad49Ee21";
  const MEMBERSHIP_TOKENS = "0xC90bE82B23Dca9453445b69fB22D5A90402654b2";

  // Deploy EncryptedArticles contract
  const EncryptedArticles = await ethers.getContractFactory("EncryptedArticles");
  const encryptedArticles = await EncryptedArticles.deploy(
    PUBLISHER_CREDENTIALS,
    MEMBERSHIP_TOKENS
  );

  // CHANGED: Wait for deployment instead of .deployed()
  await encryptedArticles.waitForDeployment();

  console.log("EncryptedArticles deployed to:", await encryptedArticles.getAddress());

  // Save deployment info
  const deploymentInfo = {
    address: await encryptedArticles.getAddress(),
    deployer: deployer.address,
    publisherCredentials: PUBLISHER_CREDENTIALS,
    membershipTokens: MEMBERSHIP_TOKENS,
    deployedAt: new Date().toISOString(),
    network: "Flow EVM Testnet",
    blockNumber: await ethers.provider.getBlockNumber()
  };

  const fs = require("fs");
  const path = require("path");
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  fs.writeFileSync(
    path.join(deploymentsDir, "EncryptedArticles.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments/EncryptedArticles.json");
  
  // Verify contract on explorer (if verification is set up)
  console.log("Verify with:");
  console.log(`npx hardhat verify --network flowTestnet ${await encryptedArticles.getAddress()} "${PUBLISHER_CREDENTIALS}" "${MEMBERSHIP_TOKENS}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });