const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  console.log('🚀 Deploying ReaderLicenseAMM pointing to CORRECT contract...');
  
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  // Use your CURRENT EncryptedArticles address (the one with 7 articles)
  const CORRECT_ENCRYPTED_ARTICLES = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';
  
  const ReaderLicenseAMM = await ethers.getContractFactory('ReaderLicenseAMM');
  const amm = await ReaderLicenseAMM.deploy(CORRECT_ENCRYPTED_ARTICLES);
  
  await amm.waitForDeployment();
  const ammAddress = await amm.getAddress();
  
  console.log('✅ NEW ReaderLicenseAMM deployed to:', ammAddress);
  console.log('🔗 Connected to EncryptedArticles:', CORRECT_ENCRYPTED_ARTICLES);
  
  // Update the EncryptedArticles to use this new AMM
  const encryptedArticles = await ethers.getContractAt('EncryptedArticles', CORRECT_ENCRYPTED_ARTICLES);
  const setAmmTx = await encryptedArticles.setReaderLicenseAMM(ammAddress);
  await setAmmTx.wait();
  
  console.log('✅ EncryptedArticles updated to use new AMM');
  
  // Save deployment info
  const deploymentInfo = {
    address: ammAddress,
    deployer: deployer.address,
    encryptedArticlesAddress: CORRECT_ENCRYPTED_ARTICLES,
    deployedAt: new Date().toISOString(),
    network: 'Flow EVM Testnet',
    version: 'Fixed'
  };
  
  fs.writeFileSync(
    './deployments/ReaderLicenseAMM-Fixed.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('📄 Deployment info saved to ReaderLicenseAMM-Fixed.json');
  console.log('🎯 NEW AMM ADDRESS:', ammAddress);
  console.log('🔧 Update your constants file with this address!');
}

main().catch(console.error);