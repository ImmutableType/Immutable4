const hre = require("hardhat");

async function main() {
  console.log("Deploying ProfileNFT to Flow EVM Testnet...");

  // Get the contract factory
  const ProfileNFT = await hre.ethers.getContractFactory("ProfileNFT");
  
  // Deploy the contract
  const profileNFT = await ProfileNFT.deploy();
  
  // Wait for deployment - ethers v6 syntax
  await profileNFT.waitForDeployment();
  
  // Get the deployed address - ethers v6 syntax
  const address = await profileNFT.getAddress();

  console.log(`ProfileNFT deployed to: ${address}`);
  
  // Get deployer address
  const [deployer] = await hre.ethers.getSigners();
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractName: "ProfileNFT",
    address: address,
    network: hre.network.name,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    membershipTokenAddress: "0xC90bE82B23Dca9453445b69fB22D5A90402654b2",
    publisherCredentialsAddress: "0x8b351Bc93799898a201E796405dBC30Aad49Ee21"
  };
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments');
  }
  
  // Save deployment info
  fs.writeFileSync(
    './deployments/ProfileNFT.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment info saved to ./deployments/ProfileNFT.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });