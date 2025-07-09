// scripts/deploy-proposal-escrow.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying ProposalEscrow contract...");

  // Get the contract factory
  const ProposalEscrow = await hre.ethers.getContractFactory("ProposalEscrow");
  
  // Get ProposalManager address from deployment
  const proposalManagerDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../deployments/ProposalManager.json"), "utf8")
  );
  
  // Deploy the contract
  const proposalEscrow = await ProposalEscrow.deploy(proposalManagerDeployment.address);
  await proposalEscrow.waitForDeployment();
  
  const address = await proposalEscrow.getAddress();
  console.log("ProposalEscrow deployed to:", address);
  
  // Save deployment info
  const deploymentInfo = {
    address: address,
    network: hre.network.name,
    deployer: (await hre.ethers.getSigners())[0].address,
    deployedAt: new Date().toISOString(),
    proposalManagerAddress: proposalManagerDeployment.address
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info
  fs.writeFileSync(
    path.join(deploymentsDir, "ProposalEscrow.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment info saved to deployments/ProposalEscrow.json");
  
  // Verify on Etherscan/Flowscan if not on localhost
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await proposalEscrow.waitForDeployment();
    
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [proposalManagerDeployment.address],
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