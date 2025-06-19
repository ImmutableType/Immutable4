// components/profile/Leaderboard.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Profile } from '@/lib/profile/types/profile';
import { GMActionService } from '@/lib/blockchain/contracts/GMAction';
import { ethers } from 'ethers';
import { useWallet } from '@/lib/hooks/useWallet';
import confetti from 'canvas-confetti';

interface LeaderboardEntry extends Profile {
  rank: number;
  score: number;
  dailyGM: boolean;
  gmStreak: number;
  totalGMs: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  profiles: Profile[];
  currentUserAddress?: string;
}

// 🔥 FIXED: Use V4 contract address from deployments
import leaderboardV4Deployment from '@/deployments/LeaderboardAggregatorV4.json';
const LEADERBOARD_V4_ADDRESS = leaderboardV4Deployment.address;

// V4 Contract ABI (minimal for what we need)
const LEADERBOARD_V4_ABI = [
  "function canUpdateSnapshot() external view returns (bool)",
  "function updateLeaderboardSnapshot() external",
  "function calculateUserScore(address user) external view returns (uint256)",
  "function getUserPoints(address user) external view returns (uint256)",
  "function snapshotUpdateRewards(address user) external view returns (uint256)"
];

const Leaderboard: React.FC<LeaderboardProps> = ({ profiles, currentUserAddress }) => {
  const { provider, address: walletAddress } = useWallet();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeUntilUpdate, setTimeUntilUpdate] = useState<string>('');
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [todaysGMCount, setTodaysGMCount] = useState<number>(0);
  const [isProcessingGM, setIsProcessingGM] = useState<string | null>(null);
  const [isUpdatingLeaderboard, setIsUpdatingLeaderboard] = useState(false);
  const [canUserUpdate, setCanUserUpdate] = useState<boolean>(false);

  // Sunrise-themed celebration
  const celebrateGM = (buttonElement: HTMLElement | null) => {
    const rect = buttonElement?.getBoundingClientRect();
    const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
    const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;

    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#FFF'];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: colors,
      ticks: 300,
    });

    const sunEmojis = confetti.shapeFromText({ text: '☀️', scalar: 2 });
    confetti({
      shapes: [sunEmojis],
      particleCount: 20,
      spread: 50,
      origin: { x, y },
      scalar: 2,
      ticks: 300,
    });

    const userEntry = leaderboardData.find(entry => entry.isCurrentUser);
    if (userEntry && userEntry.gmStreak >= 6) {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 45,
          origin: { x: 0, y: 0.9 },
          colors: ['#FFD700', '#FFA500'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 45,
          origin: { x: 1, y: 0.9 },
          colors: ['#FFD700', '#FFA500'],
        });
      }, 300);
    }
  };

  // 🔥 FIXED: Client-side score calculation with V4 point values + snapshot rewards
  const calculateScoreV4 = async (profile: Profile, gmData: { total: number; streak: number }): Promise<number> => {
    const metrics = profile.metrics;
    let baseScore = (
      20 + // BASE_SCORE
      metrics.articlesPublished * 250 + // POINTS_PER_ARTICLE
      metrics.proposalsCreated * 20 + // POINTS_PER_PROPOSAL  
      metrics.proposalsFunded * 100 + // POINTS_PER_FUNDED_PROPOSAL
      metrics.totalTipsReceived * 20 + // Tips (placeholder)
      gmData.total * 10 + // POINTS_PER_GM
      gmData.streak // Linear streak bonus (day 10 = 10 points)
    );

    // 🔥 FIXED: Add snapshot update rewards from contract
    try {
      const rpcProvider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
      const leaderboard = new ethers.Contract(LEADERBOARD_V4_ADDRESS, LEADERBOARD_V4_ABI, rpcProvider);
      const snapshotRewards = await leaderboard.snapshotUpdateRewards(profile.walletAddress);
      baseScore += Number(snapshotRewards);
    } catch (error) {
      console.error('Error fetching snapshot rewards for', profile.walletAddress, error);
    }

    return baseScore;
  };

  // 🔥 FIXED: Fetch and calculate leaderboard CLIENT-SIDE with snapshot rewards
  const fetchLeaderboardData = async () => {
    const rpcProvider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
    const gmService = new GMActionService(rpcProvider);

    // Add explicit check for current user's GM status
    if (walletAddress) {
      console.log('Checking GM status for connected wallet:', walletAddress);
      try {
        const currentUserGMStatus = await gmService.hasUserSaidGMToday(walletAddress);
        console.log('Current user has said GM today:', currentUserGMStatus);
      } catch (error) {
        console.error('Error checking current user GM status:', error);
      }
    }
    
    try {
      // Get today's GM count
      const todayCount = await gmService.getTodaysGMCount();
      setTodaysGMCount(todayCount);
      
      // Get GM data for all profiles
      const profilesWithGM = await Promise.all(
        profiles.map(async (profile) => {
          try {
            const gmStats = await gmService.getUserStats(profile.walletAddress);
            return { ...profile, gmStats };
          } catch (error) {
            return { ...profile, gmStats: { total: 0, streak: 0, saidToday: false } };
          }
        })
      );
      
      // 🔥 CLIENT-SIDE SORTING with snapshot rewards included
      const entriesWithScores = await Promise.all(
        profilesWithGM.map(async (profile) => ({
          ...profile,
          rank: 0,
          score: await calculateScoreV4(profile, profile.gmStats),
          dailyGM: profile.gmStats.saidToday,
          gmStreak: profile.gmStats.streak,
          totalGMs: profile.gmStats.total,
          isCurrentUser: !!(walletAddress && profile.walletAddress.toLowerCase() === walletAddress.toLowerCase())
        }))
      );

      const entries: LeaderboardEntry[] = entriesWithScores
        .sort((a, b) => b.score - a.score) // 🔥 FREE SORTING!
        .slice(0, 20) // Top 20
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
      
      setLeaderboardData(entries);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };

  // Handle GM click
  const handleGM = async (profileId: string) => {
    if (!provider || !walletAddress) {
      alert('Please connect your wallet to say GM!');
      return;
    }
    
    setIsProcessingGM(profileId);
    
    try {
      const signer = await provider.getSigner();
      const gmService = new GMActionService(provider, signer);
      const { txHash } = await gmService.sayGM();
      
      const buttonElement = document.querySelector(`[data-gm-button="${profileId}"]`) as HTMLElement;
      celebrateGM(buttonElement);
      
      setTimeout(() => {
        alert(`GM! ☀️\n+10 points earned!\n\nTransaction: ${txHash.slice(0, 10)}...`);
      }, 2000);
      
      await fetchLeaderboardData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessingGM(null);
    }
  };

  // 🔥 FIXED: Handle 8 PM Update Hero Button with V4 contract
  const handle8PMUpdate = async () => {
    if (!provider || !walletAddress) {
      alert('Please connect your wallet to update the leaderboard!');
      return;
    }
    
    setIsUpdatingLeaderboard(true);
    
    try {
      const signer = await provider.getSigner();
      const leaderboard = new ethers.Contract(LEADERBOARD_V4_ADDRESS, LEADERBOARD_V4_ABI, signer);
      
      // Call the V4 function
      const tx = await leaderboard.updateLeaderboardSnapshot();
      const receipt = await tx.wait();
      
      alert(`🏆 Daily 8 PM Leaderboard Updated!\n\nYou earned:\n• 100 leaderboard points\n• 10 EMOJI tokens\n\nTransaction: ${tx.hash.slice(0, 10)}...`);
      
      await fetchLeaderboardData();
      await checkUpdateAvailability();
    } catch (error: any) {
      console.error('Full error:', error);
      
      let errorMessage = 'Failed to update leaderboard';
      if (error.message?.includes('Already updated today')) {
        errorMessage = 'Leaderboard has already been updated today (next update at 8 PM ET)';
      } else if (error.message?.includes('Must hold membership or publisher token')) {
        errorMessage = 'You must hold a membership or publisher token';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient FLOW tokens to pay for gas';
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsUpdatingLeaderboard(false);
    }
  };

  // 🔥 FIXED: Check 8 PM update availability with V4 contract
  const checkUpdateAvailability = async () => {
    const rpcProvider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
    
    try {
      const leaderboard = new ethers.Contract(LEADERBOARD_V4_ADDRESS, LEADERBOARD_V4_ABI, rpcProvider);
      
      const canUpdate = await leaderboard.canUpdateSnapshot();
      setShowUpdateButton(canUpdate);
      
      if (canUpdate) {
        setTimeUntilUpdate('8 PM Update Available!');
      } else {
        setTimeUntilUpdate('Next update available at 8 PM ET');
      }
      
      // Check if user has tokens (simplified)
      if (walletAddress) {
        // For now, assume they can update if they have a connected wallet
        // TODO: Check actual token balances
        setCanUserUpdate(true);
      }
      
    } catch (error) {
      console.error('Error checking update availability:', error);
      setShowUpdateButton(false);
      setTimeUntilUpdate('Update status unknown');
      setCanUserUpdate(false);
    }
  };

  // Check update availability on mount and interval
  useEffect(() => {
    checkUpdateAvailability();
    const interval = setInterval(checkUpdateAvailability, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [walletAddress]);

  // Initial data fetch
  useEffect(() => {
    fetchLeaderboardData();
  }, [profiles, walletAddress]);

  return (
    <div style={{
      backgroundColor: 'var(--color-white)',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-headlines)',
            fontSize: '2.5rem',
            margin: 0,
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
          }}>
            🏆 All-Time Top 20
          </h2>
          <p style={{
            margin: '0.5rem 0 0 0',
            color: 'var(--color-digital-silver)',
            fontSize: '0.9rem',
          }}>
            All-Time Rankings • {todaysGMCount} GMs today • Daily 8 PM Update Ritual
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '0.9rem',
            color: 'var(--color-digital-silver)',
            marginBottom: '0.5rem',
          }}>
            {timeUntilUpdate}
          </div>

          {showUpdateButton && canUserUpdate ? (
            <div>
              {/* 🎯 8 PM UPDATE HERO BUTTON */}
              <button
                onClick={handle8PMUpdate}
                disabled={isUpdatingLeaderboard}
                style={{
                  backgroundColor: '#FFD700',
                  color: 'var(--color-black)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 'bold',
                  padding: '1rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isUpdatingLeaderboard ? 'wait' : 'pointer',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 6px rgba(255, 215, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  opacity: isUpdatingLeaderboard ? 0.7 : 1,
                  marginBottom: '0.5rem',
                }}
                onMouseOver={(e) => {
                  if (!isUpdatingLeaderboard) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(255, 215, 0, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(255, 215, 0, 0.3)';
                }}
              >
                {isUpdatingLeaderboard ? 'Updating...' : '🎯 Daily 8 PM Update Hero Button!'}
              </button>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--color-digital-silver)',
                textAlign: 'center',
              }}>
                Receive 100 Leaderboard Points + 10 EMOJI Credits
              </div>
              {/* TODO: Add anti-bot measures (CAPTCHA, rate limiting, human verification) */}
            </div>
          ) : showUpdateButton && !canUserUpdate ? (
            <div style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#FFE4B5',
              color: '#8B4513',
              fontFamily: 'var(--font-ui)',
              fontWeight: 'bold',
              borderRadius: '8px',
              fontSize: '1rem',
              textAlign: 'center',
              border: '2px solid #DEB887',
            }}>
              🔒 Need Membership or Publisher Token
            </div>
          ) : (
            <div style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#E0E0E0',
              color: '#666',
              fontFamily: 'var(--font-ui)',
              fontWeight: 'bold',
              borderRadius: '8px',
              fontSize: '1rem',
              textAlign: 'center',
            }}>
              ✅ Updated Today (Next: 8 PM ET)
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-digital-silver)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', fontWeight: 'bold' }}>Rank</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', fontWeight: 'bold' }}>Profile</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>Score</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>Articles</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>Proposals</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>Tips Given</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>GMs</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>Streak</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>Daily GM</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry) => (
              <tr
                key={entry.id}
                style={{
                  backgroundColor: entry.isCurrentUser ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (!entry.isCurrentUser) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!entry.isCurrentUser) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {entry.rank <= 3 && (
                      <span style={{ fontSize: '1.5rem' }}>
                        {entry.rank === 1 && '🥇'}
                        {entry.rank === 2 && '🥈'}
                        {entry.rank === 3 && '🥉'}
                      </span>
                    )}
                    <span style={{
                      fontWeight: entry.rank <= 3 ? 'bold' : 'normal',
                      fontSize: entry.rank <= 3 ? '1.2rem' : '1rem',
                    }}>
                      #{entry.rank}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <Link href={`/profile/${entry.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                      }}>
                        {entry.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>
                          {entry.displayName || `User ${entry.id}`}
                        </div>
                        {entry.membershipTokenId && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-digital-silver)' }}>
                            IT{entry.membershipTokenId.padStart(2, '0')}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: entry.rank <= 3 ? '#0066CC' : 'inherit',
                  }}>
                    {entry.score.toLocaleString()}
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{entry.metrics.articlesPublished}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{entry.metrics.proposalsCreated}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>0</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{entry.totalGMs}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  {entry.gmStreak >= 7 && '🔥'} {entry.gmStreak}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  {entry.isCurrentUser ? (
                    entry.dailyGM ? (
                      <span style={{ fontSize: '1.5rem' }}>☀️</span>
                    ) : (
                      <button
                        onClick={() => handleGM(entry.id)}
                        disabled={isProcessingGM === entry.id}
                        data-gm-button={entry.id}
                        style={{
                          backgroundColor: '#4ECDC4',
                          color: 'white',
                          border: 'none',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          cursor: isProcessingGM === entry.id ? 'wait' : 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {isProcessingGM === entry.id ? '...' : 'GM'}
                      </button>
                    )
                  ) : (
                    entry.dailyGM ? (
                      <span style={{ fontSize: '1.5rem' }}>☀️</span>
                    ) : (
                      <span style={{ color: 'var(--color-digital-silver)' }}>—</span>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
borderRadius: '8px',
fontSize: '0.85rem',
color: '#333333',
}}>
        <strong>V4 Scoring:</strong> Articles (250 pts) • Proposals Created (20 pts) • Proposals Funded (100 pts) • Tips Given (20 pts) • GM (10 pts each) • Linear Streak Bonus (day 10 = 10 pts) • Daily 8 PM Update (100 pts + 10 EMOJI)
        <br />
        <strong>8 PM Ritual:</strong> Daily leaderboard snapshot updates at 8 PM ET • Community-driven updates • Gas optimized with client-side sorting
      </div>
    </div>
  );
};

export default Leaderboard;