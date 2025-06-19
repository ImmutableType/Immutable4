const { ethers } = require('hardhat');

async function main() {
  const [signer] = await ethers.getSigners();
  const ammAddress = '0x2792Fc09ee569c9f98ab219c226E3f9523e8929F';
  
  const ammABI = [
    "function balanceOf(address, uint256) view returns (uint256)",
    "function uri(uint256) view returns (string)",
    "function ENCRYPTED_ARTICLES() view returns (address)"
  ];
  
  const ammContract = new ethers.Contract(ammAddress, ammABI, ethers.provider);
  
  console.log('🔍 Checking Reader License tokens in detail...');
  console.log('📍 ReaderLicenseAMM address:', ammAddress);
  console.log('👤 Your address:', signer.address);
  
  try {
    // Verify contract connection
    const connectedTo = await ammContract.ENCRYPTED_ARTICLES();
    console.log('🔗 AMM connected to:', connectedTo);
    
    // Check balance for article 8
    const balance = await ammContract.balanceOf(signer.address, 8);
    console.log('🎫 Reader license balance for article 8:', balance.toString());
    
    if (Number(balance) > 0) {
      console.log('✅ You DO have reader licenses!');
      
      // Try to get metadata
      try {
        const metadata = await ammContract.uri(8);
        console.log('📄 License metadata:', metadata);
      } catch (metaError) {
        console.log('⚠️ Metadata not available:', metaError.message);
      }
      
      console.log('');
      console.log('🎯 SOLUTIONS FOR METAMASK:');
      console.log('1. Reader licenses are ERC1155 tokens');
      console.log('2. MetaMask sometimes has trouble displaying ERC1155 balances');
      console.log('3. You can still BURN licenses for access even if not visible');
      console.log('4. Try adding to portfolio apps like OpenSea testnet');
      
    } else {
      console.log('❌ No reader licenses found');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

main().catch(console.error);
