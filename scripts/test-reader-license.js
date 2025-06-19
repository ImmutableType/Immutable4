const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Testing Reader License System...');
  
  const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
  const ammAddress = '0x2792Fc09ee569c9f98ab219c226E3f9523e8929F'; // Your new AMM
  
  const ammABI = [
    "function hasActiveAccess(uint256, address) view returns (bool)",
    "function licenseBalances(uint256, address) view returns (uint256)",
    "function getCurrentPrice(uint256) view returns (uint256)",
    "function ENCRYPTED_ARTICLES() view returns (address)"
  ];
  
  const ammContract = new ethers.Contract(ammAddress, ammABI, provider);
  
  // Test with your address and article 1
  const testAddress = '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2';
  
  try {
    // Check connection
    const connectedContract = await ammContract.ENCRYPTED_ARTICLES();
    console.log('🔗 AMM connected to:', connectedContract);
    console.log('✅ Should be: 0xd99aB3390aAF8BC69940626cdbbBf22F436c6753');
    
    // Check license balance
    const licenseBalance = await ammContract.licenseBalances(1, testAddress);
    console.log('🎫 License balance for article 1:', licenseBalance.toString());
    
    // Check access
    const hasAccess = await ammContract.hasActiveAccess(1, testAddress);
    console.log('🔐 Active access for article 1:', hasAccess);
    
    // Check current price
    try {
      const currentPrice = await ammContract.getCurrentPrice(1);
      console.log('💰 Current price for licenses:', ethers.formatEther(currentPrice), 'FLOW');
    } catch (priceError) {
      console.log('⚠️ Price check failed (expected if no licenses exist yet):', priceError.message);
    }
    
    console.log('✅ Reader License System basic connectivity working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main().catch(console.error);
