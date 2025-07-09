// scripts/setup-proposal-funding.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Setting up proposal funding system...");

  // Load deployment files
  const proposalManagerDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../deployments/ProposalManager.json"), "utf8")
  );
  const proposalEscrowDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../deployments/ProposalEscrow.json"), "utf8")
  );
  const claimTokenDeployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../deployments/ClaimToken.json"), "utf8")
  );

  const [deployer] = await hre.ethers.getSigners();

  // Get contract instances
  const ProposalManager = await hre.ethers.getContractFactory("ProposalManager");
  const proposalManager = ProposalManager.attach(proposalManagerDeployment.address);

  const ProposalEscrow = await hre.ethers.getContractFactory("ProposalEscrow");
  const proposalEscrow = ProposalEscrow.attach(proposalEscrowDeployment.address);

  const ClaimToken = await hre.ethers.getContractFactory("ClaimToken");
  const claimToken = ClaimToken.attach(claimTokenDeployment.address);

  // 1. Grant MINTER_ROLE to ProposalEscrow on ClaimToken
  console.log("Granting MINTER_ROLE to ProposalEscrow...");
  const MINTER_ROLE = await claimToken.MINTER_ROLE();
  await claimToken.grantRole(MINTER_ROLE, proposalEscrowDeployment.address);
  console.log("✓ MINTER_ROLE granted");

  // 2. Set ClaimToken address in ProposalEscrow
  console.log("Setting ClaimToken address in ProposalEscrow...");
  await proposalEscrow.setClaimToken(claimTokenDeployment.address);
  console.log("✓ ClaimToken address set");

  // 3. Set ProposalEscrow as authorized contract in ProposalManager
  console.log("Setting ProposalEscrow address in ProposalManager...");
  await proposalManager.setProposalEscrowContract(proposalEscrowDeployment.address);
  console.log("✓ ProposalEscrow authorized in ProposalManager");

  console.log("\n✅ Proposal funding system setup complete!");
  console.log("ProposalManager:", proposalManagerDeployment.address);
  console.log("ProposalEscrow:", proposalEscrowDeployment.address);
  console.log("ClaimToken:", claimTokenDeployment.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });