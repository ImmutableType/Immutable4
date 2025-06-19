const { ethers } = require('hardhat');

async function main() {
  console.log('🧪 Testing License Value Service...');
  
  // Test the license value calculation for article 8
  const ammAddress = '0x2792Fc09ee569c9f98ab219c226E3f9523e8929F';
  const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
  
  const ammABI = [
    "function getCurrentPrice(uint256) view returns (uint256)",
    "function totalLicensesEverGenerated(uint256) view returns (uint256)"
  ];
  
  const ammContract = new ethers.Contract(ammAddress, ammABI, provider);
  
  try {
    // Test article 8 (has licenses)
    console.log('📊 Testing article 8 (has licenses)...');
    const price8 = await ammContract.getCurrentPrice(8);
    const total8 = await ammContract.totalLicensesEverGenerated(8);
    
    console.log('Article 8 current price:', ethers.formatEther(price8), 'FLOW');
    console.log('Article 8 total licenses ever:', total8.toString());
    console.log('Article 8 package value:', (parseFloat(ethers.formatEther(price8)) * 10).toFixed(3), 'FLOW');
    
    // Test article 1 (might not have licenses)
    console.log('\n📊 Testing article 1 (might not have licenses)...');
    try {
      const price1 = await ammContract.getCurrentPrice(1);
      console.log('Article 1 current price:', ethers.formatEther(price1), 'FLOW');
    } catch (error) {
      console.log('Article 1 price failed (expected):', error.message);
    }
    
    console.log('\n✅ License value service test data ready!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main().catch(console.error);
