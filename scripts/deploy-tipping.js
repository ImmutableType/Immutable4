// scripts/deploy-tipping.js
const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Starting TippingContract deployment...');
  
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  // Contract addresses from existing deployments
  const TREASURY_ADDRESS = deployer.address; // Using deployer as treasury for now
  const PROFILE_NFT_ADDRESS = '0x0c4141ec0d87fA1B7820E5AF277024251d392F05';
  const EMOJI_TOKEN_ADDRESS = '0x572F036576D1D9F41876e714D47f69CEa6933c36';
  
  console.log('Using addresses:');
  console.log('- Treasury:', TREASURY_ADDRESS);
  console.log('- ProfileNFT:', PROFILE_NFT_ADDRESS);
  console.log('- EmojiToken:', EMOJI_TOKEN_ADDRESS);
  
  // Deploy TippingContract
  const TippingContract = await ethers.getContractFactory('TippingContract');
  const tippingContract = await TippingContract.deploy(
    TREASURY_ADDRESS,
    PROFILE_NFT_ADDRESS,
    EMOJI_TOKEN_ADDRESS
  );
  
  await tippingContract.waitForDeployment();
  const contractAddress = await tippingContract.getAddress();
  
  console.log('TippingContract deployed to:', contractAddress);
  
  // Save deployment info
  const deploymentInfo = {
    address: contractAddress,
    contractName: 'TippingContract',
    version: 'v1',
    network: 'flow-evm-testnet',
    deployedAt: new Date().toISOString(),
    constructorArgs: [
      TREASURY_ADDRESS,
      PROFILE_NFT_ADDRESS,
      EMOJI_TOKEN_ADDRESS
    ],
    notes: 'Initial deployment with 1 FLOW minimum tip and 1.9% fee structure'
  };
  
  const deploymentPath = path.join(__dirname, '../deployments/TippingContract.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('Deployment info saved to:', deploymentPath);
  
  // Grant MINTER_ROLE to TippingContract on EmojiToken
  console.log('\nGranting MINTER_ROLE to TippingContract...');
  try {
    const emojiToken = await ethers.getContractAt(
      'EmojiToken', 
      EMOJI_TOKEN_ADDRESS
    );
    
    // Get MINTER_ROLE constant
    const MINTER_ROLE = await emojiToken.MINTER_ROLE();
    
    // Grant role
    const grantTx = await emojiToken.grantRole(MINTER_ROLE, contractAddress);
    await grantTx.wait();
    
    console.log('✅ MINTER_ROLE granted successfully');
    
    // Verify the role was granted
    const hasRole = await emojiToken.hasRole(MINTER_ROLE, contractAddress);
    console.log('✅ Role verification:', hasRole ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Failed to grant MINTER_ROLE:', error.message);
    console.log('You may need to grant this role manually later');
  }
  
  console.log('\n🎉 TippingContract deployment complete!');
  console.log('Contract address:', contractAddress);
  console.log('Remember to update LeaderboardAggregatorV4 with the tips contract address');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });