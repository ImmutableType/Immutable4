import { ethers } from 'ethers';

// Load deployment info
const deployments = require('../data/deployments.json');

// Contract ABIs (simplified for admin functions)
const PUBLISHER_CREDENTIALS_ABI = [
  "function issueCredential(address journalist, string name, string[] geographicRights, string[] subjectRights) external returns (uint256)",
  "function revokeCredential(uint256 tokenId) external",
  "function getCredential(uint256 tokenId) external view returns (address journalist, string name, string[] geographicRights, string[] subjectRights, uint256 issuedAt, bool isActive)",
  "function hasValidCredential(address journalist) external view returns (bool)",
  "function totalSupply() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event CredentialIssued(uint256 indexed tokenId, address indexed journalist, string name)",
  "event CredentialRevoked(uint256 indexed tokenId, address indexed journalist)"
];

const MEMBERSHIP_TOKENS_ABI = [
  "function mintToken(uint256 tokenId, address to, string name) external",
  "function getMember(uint256 tokenId) external view returns (address owner, string name, uint256 mintedAt, bool isActive)",
  "function isTokenMinted(uint256 tokenId) external view returns (bool)",
  "function getAvailableTokens() external view returns (uint256[])",
  "function totalMinted() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "event TokenMinted(uint256 indexed tokenId, address indexed owner, string name)"
];

// Constants for debugging
// contractService.ts - corrected
const FLOW_EVM_TESTNET_CHAIN_ID = '0x221'; // 545 in hex - YOUR working chain ID
const FLOW_EVM_TESTNET_NAME = 'Flow EVM Testnet';

// Type definitions for better error handling
interface MetaMaskError {
  code?: number;
  message: string;
  reason?: string;
  transaction?: any;
}

export class ContractService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.JsonRpcSigner | null = null;
  private publisherContract: ethers.Contract | null = null;
  private membershipContract: ethers.Contract | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
  }

  // Debug helper - comprehensive MetaMask state check
  async debugMetaMask(): Promise<boolean> {
    console.log('🔍 MetaMask Debug Check');
    
    if (!window.ethereum) {
      console.error('❌ MetaMask not installed');
      return false;
    }

    try {
      // Check accounts
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      console.log('📍 Connected accounts:', accounts);

      // Check network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('📍 Current network:', chainId, chainId === FLOW_EVM_TESTNET_CHAIN_ID ? '✅ Flow EVM Testnet' : '❌ Wrong Network');

      // Check if MetaMask is responsive
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const network = await browserProvider.getNetwork();
      console.log('📍 Provider network:', network.chainId.toString(), network.name);

      // Check balance
      if (accounts.length > 0) {
        const balance = await browserProvider.getBalance(accounts[0]);
        console.log('📍 Balance:', ethers.formatEther(balance), 'FLOW');
        
        // Fixed BigInt comparison
        if (balance === BigInt(0)) {
          console.warn('⚠️ Zero FLOW balance - transactions will fail');
        }
      }

      // Check if contracts are accessible
      if (deployments.membershipTokens && deployments.publisherCredentials) {
        console.log('📍 Contract addresses loaded:');
        console.log('  - Membership:', deployments.membershipTokens);
        console.log('  - Publisher:', deployments.publisherCredentials);
      }

      return accounts.length > 0 && chainId === FLOW_EVM_TESTNET_CHAIN_ID;
    } catch (error) {
      console.error('❌ MetaMask debug failed:', error);
      return false;
    }
  }

  // Test connection with a simple transaction
  async testConnection(): Promise<void> {
    console.log('🧪 Testing connection with simple transaction...');
    
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const address = await this.signer.getAddress();
      const balance = await this.signer.provider.getBalance(address);
      console.log('📍 Test - Balance check successful:', ethers.formatEther(balance), 'FLOW');
      
      // Try a simple transaction to self (0 value) - this will test MetaMask popup
      const tx = await this.signer.sendTransaction({
        to: address,
        value: 0,
        gasLimit: 21000
      });
      
      console.log('✅ Test transaction successful:', tx.hash);
      await tx.wait();
      console.log('✅ Test transaction confirmed');
    } catch (error) {
      console.error('❌ Test connection failed:', error);
      throw error;
    }
  }




  async connectWallet() {
    console.log('🚀 ContractService: Connecting wallet...');
    
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not found');
    }
  
    try {
      // Ensure we're on the right network first
      await this.ensureCorrectNetwork();
      
      // Get accounts (should already be available from useWallet)
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts connected');
      }
  
      // Create provider and signer
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await browserProvider.getSigner();
      
      const signerAddress = await this.signer.getAddress();
      console.log('📍 ContractService: Signer address:', signerAddress);
  
      // Initialize contracts
      this.publisherContract = new ethers.Contract(
        deployments.publisherCredentials,
        PUBLISHER_CREDENTIALS_ABI,
        this.signer
      );
      
      this.membershipContract = new ethers.Contract(
        deployments.membershipTokens,
        MEMBERSHIP_TOKENS_ABI,
        this.signer
      );
      
      console.log('✅ ContractService: Contracts initialized');
      return true;
  
    } catch (error: unknown) {
      const err = error as MetaMaskError;
      console.error('❌ ContractService: Connection failed:', err);
      throw new Error(`Contract service connection failed: ${err.message}`);
    }
  }






  // Helper function to get current FLOW price and calculate gas limit
  private async getGasLimit(): Promise<number> {
    // Set gas limit to 1 million units (should cost ~$0.002 USD on Flow EVM)
    // This ensures SVG generation operations complete successfully
    return 1_000_000;
  }

  // Enhanced transaction execution with debugging
  private async executeTransaction(contractMethod: any, methodName: string, ...args: any[]) {
    console.log(`🚀 Executing ${methodName} with args:`, args);

    try {
      // Method 1: Try with gas estimation
      try {
        console.log('📍 Attempting gas estimation...');
        const gasEstimate = await contractMethod.estimateGas(...args);
        console.log('📍 Gas estimate:', gasEstimate.toString());

        const tx = await contractMethod(...args, {
          gasLimit: gasEstimate + BigInt(100000), // Add buffer
        });

        console.log(`✅ ${methodName} transaction submitted:`, tx.hash);
        const receipt = await tx.wait();
        console.log(`✅ ${methodName} transaction confirmed:`, receipt.transactionHash);
        return receipt;

      } catch (gasError: unknown) {
        const error = gasError as MetaMaskError;
        console.warn(`⚠️ Gas estimation failed for ${methodName}, trying fixed gas:`, error.message);
        
        // Method 2: Try with fixed gas
        const gasLimit = await this.getGasLimit();
        const tx = await contractMethod(...args, { gasLimit });

        console.log(`✅ ${methodName} transaction submitted (fixed gas):`, tx.hash);
        const receipt = await tx.wait();
        console.log(`✅ ${methodName} transaction confirmed:`, receipt.transactionHash);
        return receipt;
      }

    } catch (error: unknown) {
      const err = error as MetaMaskError;
      console.error(`❌ ${methodName} failed:`, {
        message: err.message,
        code: err.code,
        reason: err.reason,
        transaction: err.transaction
      });

      // Provide specific error messages
      if (err.code === 4001) {
        throw new Error('Transaction rejected by user');
      } else if (err.code === -32603) {
        throw new Error('Internal JSON-RPC error. Try resetting MetaMask account in Settings → Advanced → Reset Account.');
      } else if (err.message.includes('insufficient funds')) {
        throw new Error('Insufficient FLOW balance for gas fees');
      } else if (err.message.includes('nonce')) {
        throw new Error('Nonce error. Try resetting your MetaMask account.');
      } else {
        throw new Error(`Transaction failed: ${err.message}`);
      }
    }
  }

  // Publisher Credentials Methods (Enhanced)
  async issueCredential(journalist: string, name: string, geographicRights: string[], subjectRights: string[]) {
    if (!this.publisherContract) throw new Error('Contract not connected');
    
    return await this.executeTransaction(
      this.publisherContract.issueCredential,
      'issueCredential',
      journalist,
      name,
      geographicRights,
      subjectRights
    );
  }

  async revokeCredential(tokenId: number) {
    if (!this.publisherContract) throw new Error('Contract not connected');
    
    return await this.executeTransaction(
      this.publisherContract.revokeCredential,
      'revokeCredential',
      tokenId
    );
  }

  async getPublisherCredential(tokenId: number) {
    if (!this.publisherContract) throw new Error('Contract not connected');
    
    const result = await this.publisherContract.getCredential(tokenId);
    return {
      journalist: result[0],
      name: result[1],
      geographicRights: result[2],
      subjectRights: result[3],
      issuedAt: result[4],
      isActive: result[5]
    };
  }

  async getTotalPublisherCredentials() {
    if (!this.publisherContract) throw new Error('Contract not connected');
    return await this.publisherContract.totalSupply();
  }

  // Membership Tokens Methods (Enhanced)
  async mintMemberToken(tokenId: number, to: string, name: string) {
    if (!this.membershipContract) throw new Error('Contract not connected');
    
    return await this.executeTransaction(
      this.membershipContract.mintToken,
      'mintMemberToken',
      tokenId,
      to,
      name
    );
  }

  async getMemberToken(tokenId: number) {
    if (!this.membershipContract) throw new Error('Contract not connected');
    
    const result = await this.membershipContract.getMember(tokenId);
    return {
      owner: result[0],
      name: result[1],
      mintedAt: result[2],
      isActive: result[3]
    };
  }

  async getMemberTokenURI(tokenId: number) {
    if (!this.membershipContract) throw new Error('Contract not connected');
    
    try {
      return await this.membershipContract.tokenURI(tokenId);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Failed to get token URI:', err);
      throw err;
    }
  }

  async isTokenMinted(tokenId: number) {
    if (!this.membershipContract) throw new Error('Contract not connected');
    return await this.membershipContract.isTokenMinted(tokenId);
  }

  async getTotalMemberTokens() {
    if (!this.membershipContract) throw new Error('Contract not connected');
    return await this.membershipContract.totalMinted();
  }

  async getAvailableTokens() {
    if (!this.membershipContract) throw new Error('Contract not connected');
    return await this.membershipContract.getAvailableTokens();
  }

  // Network helper methods
  // Update this section in your contractService.ts
async ensureCorrectNetwork() {
  if (!window.ethereum) throw new Error('MetaMask not found');

  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
  
  if (currentChainId !== FLOW_EVM_TESTNET_CHAIN_ID) {
    console.log(`🔄 Switching to ${FLOW_EVM_TESTNET_NAME}...`);
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: FLOW_EVM_TESTNET_CHAIN_ID }],
      });
      console.log(`✅ Switched to ${FLOW_EVM_TESTNET_NAME}`);
    } catch (error: unknown) {
      const err = error as MetaMaskError;
      if (err.code === 4902) {
        // Network not added, add it with the correct configuration
        console.log('📍 Adding Flow EVM Testnet to MetaMask...');
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: FLOW_EVM_TESTNET_CHAIN_ID,
            chainName: 'Flow EVM Testnet',
            nativeCurrency: {
              name: 'Flow',
              symbol: 'FLOW',
              decimals: 18
            },
            rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
            blockExplorerUrls: ['https://evm-testnet.flowscan.org'],
            iconUrls: ['https://cryptologos.cc/logos/flow-flow-logo.png'] // Add Flow icon
          }]
        });
        console.log(`✅ Added and switched to ${FLOW_EVM_TESTNET_NAME}`);
      } else {
        throw err;
      }
    }
  }
}
}

export const contractService = new ContractService();