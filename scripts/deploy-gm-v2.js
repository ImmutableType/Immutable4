const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying GMActionV2...");
  
  const profileNFTAddress = "0x0c4141ec0d87fA1B7820E5AF277024251d392F05";
  
  const GMActionV2 = await ethers.getContractFactory("GMActionV2");
  const gmAction = await GMActionV2.deploy(profileNFTAddress);
  await gmAction.waitForDeployment();
  
  console.log("GMActionV2 deployed to:", await gmAction.getAddress());
  
  // Save deployment info
  const deploymentInfo = {
    address: await gmAction.getAddress(),
    abi: GMActionV2.interface.format("json")
  };
  
  fs.writeFileSync("./deployments/GMActionV2.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to ./deployments/GMActionV2.json");
}

main().catch(console.error);