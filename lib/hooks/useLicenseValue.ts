// lib/hooks/useLicenseValue.ts
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface LicenseValueData {
  licensePrice: string;
  totalLicenses: string;
  totalValue: string;
  isLoading: boolean;
  error: Error | null;
}

export function useLicenseValue(articleId: string): LicenseValueData {
  const [data, setData] = useState<LicenseValueData>({
    licensePrice: '0',
    totalLicenses: '0',
    totalValue: '0',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!articleId) return;

    const fetchLicenseValue = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
        
        // Connect to your working contracts
        const ammContract = new ethers.Contract(
          '0x4E0f2A3A8AfEd1f86D83AAB1a989E01c316996d2', // Your new working AMM
          [
            'function getCurrentPrice(uint256) external view returns (uint256)',
            'function totalLicensesEverGenerated(uint256) external view returns (uint256)'
          ],
          provider
        );

        const articlesContract = new ethers.Contract(
          '0xd99aB3390aAF8BC69940626cdbbBf22F436c6753', // Your articles contract
          [
            'function articles(uint256) external view returns (uint256, string, string, string, address, string, string, uint256, uint256, uint256, uint256, uint256, uint8, uint256)'
          ],
          provider
        );

        // Get article data for license ratio
        const articleData = await articlesContract.articles(articleId);
        const readerLicenseRatio = Number(articleData[11]); // position 12 in 14-value array (0-indexed)
        
        // Check if licenses exist
        const totalGenerated = await ammContract.totalLicensesEverGenerated(articleId);
        
        if (totalGenerated.toString() === '0') {
          // No licenses exist yet - use base price
          const basePrice = ethers.parseEther('0.01'); // BASE_PRICE from contract
          
          setData({
            licensePrice: ethers.formatEther(basePrice),
            totalLicenses: readerLicenseRatio.toString(),
            totalValue: ethers.formatEther(basePrice * BigInt(readerLicenseRatio)),
            isLoading: false,
            error: null
          });
        } else {
          // Licenses exist - get current bonding curve price
          const currentPrice = await ammContract.getCurrentPrice(articleId);
          const priceFormatted = ethers.formatEther(currentPrice);
          const totalValueForNFT = parseFloat(priceFormatted) * readerLicenseRatio;
          
          setData({
            licensePrice: priceFormatted,
            totalLicenses: readerLicenseRatio.toString(),
            totalValue: totalValueForNFT.toString(),
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error fetching license value:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error
        }));
      }
    };

    fetchLicenseValue();
  }, [articleId]);

  return data;
}