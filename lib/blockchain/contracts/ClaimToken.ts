// lib/blockchain/contracts/ClaimToken.ts
import { ethers } from 'ethers';
import ClaimTokenABI from './ClaimToken.abi.json';

export class ClaimToken {
  private contract: ethers.Contract;

  constructor(address: string, providerOrSigner: ethers.Provider | ethers.Signer) {
    this.contract = new ethers.Contract(address, ClaimTokenABI, providerOrSigner);
  }

  async balanceOf(owner: string): Promise<bigint> {
    return await this.contract.balanceOf(owner);
  }

  async tokenOfOwnerByIndex(owner: string, index: number): Promise<bigint> {
    return await this.contract.tokenOfOwnerByIndex(owner, index);
  }

  async getProposalId(tokenId: number): Promise<number> {
    const result = await this.contract.getProposalId(tokenId);
    return Number(result);
  }

  async getNftAllocation(tokenId: number): Promise<number> {
    const result = await this.contract.getNftAllocation(tokenId);
    return Number(result);
  }
}