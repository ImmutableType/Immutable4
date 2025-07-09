// lib/blockchain/contracts/ClaimToken.ts
import { ethers } from 'ethers';
import ClaimTokenABI from './ClaimToken.abi.json';

export interface TokenData {
  proposalId: bigint;
  nftAllocation: bigint;
  originalFunder: string;
  mintedAt: bigint;
}

export class ClaimToken {
  private contract: ethers.Contract;

  constructor(address: string, providerOrSigner: ethers.Provider | ethers.Signer) {
    this.contract = new ethers.Contract(address, ClaimTokenABI, providerOrSigner);
  }

  async balanceOf(owner: string): Promise<bigint> {
    return await this.contract.balanceOf(owner);
  }

  async ownerOf(tokenId: number): Promise<string> {
    return await this.contract.ownerOf(tokenId);
  }

  async getTokenData(tokenId: number): Promise<TokenData> {
    return await this.contract.getTokenData(tokenId);
  }
}