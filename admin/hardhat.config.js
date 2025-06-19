require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

module.exports = {
    solidity: {
        version: '0.8.20',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        'flow-evm-testnet': {
            url: 'https://testnet.evm.nodes.onflow.org',
            accounts: [process.env.PRIVATE_KEY],
            chainId: 545
        }
    },
    etherscan: {
        apiKey: {
            'flow-evm-testnet': 'not-needed'
        },
        customChains: [
            {
                network: 'flow-evm-testnet',
                chainId: 545,
                urls: {
                    apiURL: 'https://evm-testnet.flowscan.io/api',
                    browserURL: 'https://evm-testnet.flowscan.io'
                }
            }
        ]
    }
};
