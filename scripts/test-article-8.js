const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Testing Article #8 (new article with new AMM)...');
  
  const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
  const encryptedAddress = '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753';
  const ammAddress = '0x2792Fc09ee569c9f98ab219c226E3f9523e8929F';
  
  const encryptedABI = ["function getTotalArticles() view returns (uint256)"];
  const ammABI = ["function licenseBalances(uint256, address) view returns (uint256)"];
  
  const encryptedContract = new ethers.Contract(encryptedAddress, encryptedABI, provider);
  const ammContract = new ethers.Contract(ammAddress, ammABI, provider);
  
  try {
    const totalArticles = await encryptedContract.getTotalArticles();
    console.log('📊 Total articles:', totalArticles.toString());
    
    if (Number(totalArticles) >= 8) {
      console.log('✅ Article #8 exists! Ready for testing.');
      
      // Check license balance for article 8
      const testAddress = '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2';
      const licenseBalance = await ammContract.licenseBalances(8, testAddress);
      console.log('🎫 License balance for article 8:', licenseBalance.toString());
      
      if (Number(licenseBalance) > 0) {
        console.log('🎉 SUCCESS! New AMM is working with new articles!');
      } else {
        console.log('⏳ No licenses yet - need to buy NFT for article 8');
      }
    } else {
      console.log('⏳ Article #8 not published yet');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main().catch(console.error);
