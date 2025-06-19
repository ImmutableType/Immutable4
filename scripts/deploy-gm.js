const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying GMAction contract...");

  // Get the ProfileNFT address from deployment file
  const profileDeploymentPath = path.join(__dirname, "../deployments/ProfileNFT.json");
  const profileDeployment = JSON.parse(fs.readFileSync(profileDeploymentPath, "utf8"));
  const profileNFTAddress = profileDeployment.address;
  
  console.log("Using ProfileNFT at:", profileNFTAddress);

  // Deploy GMAction
  const GMAction = await hre.ethers.getContractFactory("GMAction");
  const gmAction = await GMAction.deploy(profileNFTAddress);
  await gmAction.waitForDeployment();

  const gmAddress = await gmAction.getAddress();
  console.log("GMAction deployed to:", gmAddress);

  // Save deployment info
  const deployment = {
    contractName: "GMAction",
    address: gmAddress,
    network: "flowTestnet",
    deployer: (await hre.ethers.provider.getSigner()).address,
    deployedAt: new Date().toISOString(),
    profileNFTAddress: profileNFTAddress
  };

  const deploymentPath = path.join(__dirname, "../deployments/GMAction.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log("Deployment info saved to:", deploymentPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });