// scripts/deploy-proposal-manager.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying ProposalManager contract...");

  // Contract addresses from existing deployments
  const PROFILE_NFT = "0x0c4141ec0d87fA1B7820E5AF277024251d392F05";
  const MEMBERSHIP_TOKENS = "0xC90bE82B23Dca9453445b69fB22D5A90402654b2";
  const PUBLISHER_CREDENTIALS = "0x8b351Bc93799898a201E796405dBC30Aad49Ee21";

  // Deploy ProposalManager
  const ProposalManager = await hre.ethers.getContractFactory("ProposalManager");
  const proposalManager = await ProposalManager.deploy(
    PROFILE_NFT,
    MEMBERSHIP_TOKENS,
    PUBLISHER_CREDENTIALS
  );

  await proposalManager.waitForDeployment();
  const address = await proposalManager.getAddress();

  console.log("ProposalManager deployed to:", address);

  // Save deployment info
  const deploymentInfo = {
    address: address,
    abi: JSON.parse(proposalManager.interface.formatJson()),
    deployer: (await hre.ethers.getSigners())[0].address,
    deploymentDate: new Date().toISOString(),
    network: hre.network.name,
    dependencies: {
      profileNFT: PROFILE_NFT,
      membershipTokens: MEMBERSHIP_TOKENS,
      publisherCredentials: PUBLISHER_CREDENTIALS
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment file
  fs.writeFileSync(
    path.join(deploymentsDir, "ProposalManager.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments/ProposalManager.json");

  // Verify contract on explorer (if not on localhost)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await proposalManager.waitForDeployment();
    
    console.log("Verifying contract on explorer...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [
          PROFILE_NFT,
          MEMBERSHIP_TOKENS,
          PUBLISHER_CREDENTIALS
        ],
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