const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Deploying PortfolioArticles contract to Flow EVM...');
  
  // Get the contract factory - UPDATED PATH
  const PortfolioArticles = await ethers.getContractFactory('contracts/content/PortfolioArticles.sol:PortfolioArticles');
  
  // Configuration for Flow EVM testnet
  const PUBLISHER_TOKEN_CONTRACT = '0x8b351Bc93799898a201E796405dBC30Aad49Ee21'; // Publisher credentials
  const TREASURY_WALLET = '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2'; // Treasury wallet
  
  console.log('📋 Contract Configuration:');
  console.log('- Publisher Token Contract:', PUBLISHER_TOKEN_CONTRACT);
  console.log('- Treasury Wallet:', TREASURY_WALLET);
  console.log('- Portfolio Article Fee: 1 FLOW');
  console.log('- Max Posts Per Day: 10');
  console.log('- Contract Location: contracts/content/PortfolioArticles.sol');
  
  // Deploy the contract
  console.log('\n⏳ Deploying contract...');
  const portfolioArticles = await PortfolioArticles.deploy(
    PUBLISHER_TOKEN_CONTRACT,
    TREASURY_WALLET
  );
  
  // Wait for deployment to complete
  await portfolioArticles.waitForDeployment();
  const contractAddress = await portfolioArticles.getAddress();
  
  console.log('✅ PortfolioArticles deployed successfully!');
  console.log('📍 Contract Address:', contractAddress);
  
  // Verify deployment by calling a read function
  try {
    const contractInfo = await portfolioArticles.getContractInfo();
    console.log('\n🔍 Contract Verification:');
    console.log('- Publisher Contract:', contractInfo[0]);
    console.log('- Treasury Address:', contractInfo[1]);
    console.log('- Article Fee:', ethers.formatEther(contractInfo[2]), 'FLOW');
    console.log('- Total Articles:', contractInfo[3].toString());
  } catch (error) {
    console.error('❌ Contract verification failed:', error.message);
  }
  
  // Save deployment information
  const deploymentInfo = {
    address: contractAddress,
    deployer: (await ethers.getSigners())[0].address,
    deploymentTime: new Date().toISOString(),
    network: 'flow-evm-testnet',
    contractName: 'PortfolioArticles',
    contractPath: 'contracts/content/PortfolioArticles.sol', // UPDATED PATH
    constructorArgs: [
      PUBLISHER_TOKEN_CONTRACT,
      TREASURY_WALLET
    ],
    config: {
      portfolioArticleFee: '1000000000000000000', // 1 FLOW in wei
      maxPostsPerDay: 10,
      publisherTokenContract: PUBLISHER_TOKEN_CONTRACT,
      treasuryWallet: TREASURY_WALLET
    }
  };
  
  // Ensure deployments directory exists
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Write deployment info to file
  const deploymentPath = path.join(deploymentsDir, 'PortfolioArticles.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log('\n💾 Deployment info saved to:', deploymentPath);
  
  // Display next steps
  console.log('\n🎯 Next Steps:');
  console.log('1. Update .env with contract address if needed');
  console.log('2. Verify contract on FlowScan (optional)');
  console.log('3. Update frontend to use new contract address');
  console.log('4. Test contract integration');
  
  console.log('\n📋 Contract Integration Info:');
  console.log('- Import path: import deploymentInfo from "../deployments/PortfolioArticles.json"');
  console.log('- Contract address:', contractAddress);
  console.log('- Network: Flow EVM Testnet');
  console.log('- Chain ID: 545');
  
  return {
    contractAddress,
    deploymentInfo
  };
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 Portfolio Articles deployment completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = main;