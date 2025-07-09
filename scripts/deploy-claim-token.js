// scripts/deploy-claim-token.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying ClaimToken contract...");

  // Get the contract factory
  const ClaimToken = await hre.ethers.getContractFactory("ClaimToken");
  
  // Deploy the contract
  const claimToken = await ClaimToken.deploy();
  await claimToken.waitForDeployment();
  
  const address = await claimToken.getAddress();
  console.log("ClaimToken deployed to:", address);
  
  // Save deployment info
  const deploymentInfo = {
    address: address,
    network: hre.network.name,
    deployer: (await hre.ethers.getSigners())[0].address,
    deployedAt: new Date().toISOString()
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info
  fs.writeFileSync(
    path.join(deploymentsDir, "ClaimToken.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment info saved to deployments/ClaimToken.json");
  
  // Verify on Etherscan/Flowscan if not on localhost
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await claimToken.waitForDeployment();
    
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });