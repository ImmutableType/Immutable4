const { ethers } = require("hardhat");

async function main() {
    console.log("Starting BookmarkContract deployment...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Contract addresses from your existing deployments
    const PROFILE_NFT_ADDRESS = "0x0c4141ec0d87fA1B7820E5AF277024251d392F05";
    const TREASURY_WALLET_ADDRESS = "0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2";
    
    // Deploy BookmarkContract
    const BookmarkContract = await ethers.getContractFactory("BookmarkContract");
    const bookmarkContract = await BookmarkContract.deploy(
        PROFILE_NFT_ADDRESS,
        TREASURY_WALLET_ADDRESS
    );

    await bookmarkContract.waitForDeployment();
    const contractAddress = await bookmarkContract.getAddress();
    
    console.log("BookmarkContract deployed to:", contractAddress);
    
    // Verify deployment
    console.log("\nVerifying deployment...");
    const contractInfo = await bookmarkContract.getContractInfo();
    console.log("Profile NFT address:", contractInfo[0]);
    console.log("Treasury wallet:", contractInfo[1]);
    console.log("Bookmark fee:", ethers.formatEther(contractInfo[2]), "FLOW");
    
    // Save deployment info
    const deploymentInfo = {
        contractName: "BookmarkContract",
        address: contractAddress,
        network: "flow-evm-testnet",
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        profileNFTAddress: PROFILE_NFT_ADDRESS,
        treasuryWallet: TREASURY_WALLET_ADDRESS,
        bookmarkFee: "0.001",
        constructorArgs: [
            PROFILE_NFT_ADDRESS,
            TREASURY_WALLET_ADDRESS
        ],
        notes: "Bookmark system with treasury fee doubling and profile gating"
    };
    
    // Write deployment info to file
    const fs = require('fs');
    const path = require('path');
    
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(
        path.join(deploymentsDir, 'BookmarkContract.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\nDeployment complete!");
    console.log("Contract address:", contractAddress);
    console.log("Deployment info saved to: deployments/BookmarkContract.json");
    
    return contractAddress;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });