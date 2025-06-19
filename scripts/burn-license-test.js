const { ethers } = require('hardhat');

async function main() {
  const [signer] = await ethers.getSigners();
  const ammAddress = '0x2792Fc09ee569c9f98ab219c226E3f9523e8929F';
  
  const ammABI = [
    "function balanceOf(address, uint256) view returns (uint256)",
    "function burnLicenseForAccess(uint256) external",
    "function hasActiveAccess(uint256, address) view returns (bool)"
  ];
  
  const ammContract = new ethers.Contract(ammAddress, ammABI, signer);
  
  console.log('🔥 Testing license burn (this will cost gas)...');
  
  try {
    // Check current balance
    const beforeBalance = await ammContract.balanceOf(signer.address, 8);
    console.log('📊 Current licenses for article 8:', beforeBalance.toString());
    
    if (Number(beforeBalance) > 0) {
      console.log('🔥 Burning 1 license for 7-day access...');
      const tx = await ammContract.burnLicenseForAccess(8);
      await tx.wait();
      
      const afterBalance = await ammContract.balanceOf(signer.address, 8);
      const hasAccess = await ammContract.hasActiveAccess(8, signer.address);
      
      console.log('📊 After burn - Licenses:', afterBalance.toString());
      console.log('🔐 Has access:', hasAccess);
      
      if (hasAccess) {
        console.log('🎉 SUCCESS! You now have 7-day access to article 8!');
      }
    } else {
      console.log('❌ No licenses to burn');
    }
    
  } catch (error) {
    console.error('❌ Burn failed:', error.message);
  }
}

main().catch(console.error);
