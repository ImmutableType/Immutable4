const { ethers } = require('hardhat');

async function main() {
    console.log('Deploying ImmutableType contracts to Flow EVM Testnet...');
    
    const [deployer] = await ethers.getSigners();
    console.log('Deploying with account:', deployer.address);
    console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString());
    
    // Deploy PublisherCredentials
    console.log('\n--- Deploying PublisherCredentials ---');
    const PublisherCredentials = await ethers.getContractFactory('PublisherCredentials');
    const publisherCredentials = await PublisherCredentials.deploy();
    await publisherCredentials.waitForDeployment();
    
    console.log('PublisherCredentials deployed to:', await publisherCredentials.getAddress());
    
    // Deploy MembershipTokens (with your address as God Token owner)
    console.log('\n--- Deploying MembershipTokens ---');
    const MembershipTokens = await ethers.getContractFactory('MembershipTokens');
    const godTokenOwner = '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2'; // Your address
    const membershipTokens = await MembershipTokens.deploy(godTokenOwner);
    await membershipTokens.waitForDeployment();
    
    console.log('MembershipTokens deployed to:', await membershipTokens.getAddress());
    console.log('God Token #0 minted to:', godTokenOwner);
    
    // Save deployment addresses
    const deploymentInfo = {
        network: 'flow-evm-testnet',
        publisherCredentials: await publisherCredentials.getAddress(),
        membershipTokens: await membershipTokens.getAddress(),
        godTokenOwner: godTokenOwner,
        deployedAt: new Date().toISOString()
    };
    
    console.log('\n--- Deployment Summary ---');
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync(
        'data/deployments.json', 
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log('\nDeployment info saved to data/deployments.json');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
